import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/api';
import { User, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    designation: '',
    salary: '',
    salaryDate: '',
    startingBalance: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Mock data from auth user
      setProfileData({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        email: user?.email || '',
        designation: 'Software Engineer',
        salary: '85000',
        salaryDate: '1',
        startingBalance: '50000',
      });
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile(profileData);
      updateUser(response.data);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const renderField = (label, value, name, type = 'text', readOnly = false) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {isEditing && !readOnly ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            data-testid={`${name}-input`}
          />
        ) : (
          <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800" data-testid={`${name}-display`}>
            {value || 'Not set'}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" data-testid="profile-title">Profile</h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="edit-profile-button"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                data-testid="cancel-edit-button"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                data-testid="save-profile-button"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {profileData.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profileData.fullName}</h2>
              <p className="text-gray-600">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('Full Name', profileData.fullName, 'fullName')}
              {renderField('Phone Number', profileData.phone, 'phone', 'tel', true)}
              {renderField('Email', profileData.email, 'email', 'email')}
              {renderField('Designation', profileData.designation, 'designation')}
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Monthly Salary (₹)', profileData.salary, 'salary', 'number')}
                {renderField('Salary Receiving Date', profileData.salaryDate, 'salaryDate', 'number')}
                {renderField('Starting Balance (₹)', profileData.startingBalance, 'startingBalance', 'number')}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Update Starting Balance when you get a promotion or major income change
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
