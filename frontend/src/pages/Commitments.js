import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { commitmentAPI } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/exportUtils';
import { COMMITMENT_TYPES } from '@/utils/categories';
import { Plus, X, Edit2, Trash2, Calendar, Bell, BellOff } from 'lucide-react';

const Commitments = () => {
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EMI',
    amount: '',
    deductionDate: '',
    endDate: '',
    reminderEnabled: true,
  });

  useEffect(() => {
    fetchCommitments();
  }, []);

  const fetchCommitments = async () => {
    try {
      setLoading(true);
      const response = await commitmentAPI.getAll();
      setCommitments(response.data);
    } catch (error) {
      console.error('Error fetching commitments:', error);
      // Mock data
      setCommitments([
        {
          id: 1,
          name: 'Car EMI',
          type: 'EMI',
          amount: 15000,
          deductionDate: 5,
          endDate: '2027-03-01',
          reminderEnabled: true,
        },
        {
          id: 2,
          name: 'Netflix Subscription',
          type: 'Subscription',
          amount: 799,
          deductionDate: 15,
          endDate: null,
          reminderEnabled: true,
        },
        {
          id: 3,
          name: 'House Rent',
          type: 'Rent',
          amount: 25000,
          deductionDate: 1,
          endDate: null,
          reminderEnabled: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDeduction = (deductionDate) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    let nextMonth = currentMonth;
    let nextYear = currentYear;

    if (currentDay >= deductionDate) {
      nextMonth = currentMonth + 1;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
    }

    return new Date(nextYear, nextMonth, deductionDate);
  };

  const calculateRemainingMonths = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const months = (end.getFullYear() - today.getFullYear()) * 12 + (end.getMonth() - today.getMonth());
    return Math.max(0, months);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        deductionDate: parseInt(formData.deductionDate),
      };

      if (editingId) {
        await commitmentAPI.update(editingId, data);
      } else {
        await commitmentAPI.create(data);
      }

      await fetchCommitments();
      resetForm();
    } catch (error) {
      console.error('Error saving commitment:', error);
      if (error.response?.status === 409) {
        alert('A commitment with this name already exists');
      } else {
        alert('Failed to save commitment');
      }
    }
  };

  const handleEdit = (commitment) => {
    setEditingId(commitment.id);
    setFormData({
      name: commitment.name,
      type: commitment.type,
      amount: commitment.amount.toString(),
      deductionDate: commitment.deductionDate.toString(),
      endDate: commitment.endDate || '',
      reminderEnabled: commitment.reminderEnabled,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this commitment?')) {
      try {
        await commitmentAPI.delete(id);
        await fetchCommitments();
      } catch (error) {
        console.error('Error deleting commitment:', error);
        alert('Failed to delete commitment');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      type: 'EMI',
      amount: '',
      deductionDate: '',
      endDate: '',
      reminderEnabled: true,
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      EMI: 'bg-blue-100 text-blue-800',
      Subscription: 'bg-purple-100 text-purple-800',
      Rent: 'bg-green-100 text-green-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.Other;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" data-testid="commitments-title">Commitments</h1>
            <p className="text-gray-600">Manage your recurring expenses</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="add-commitment-button"
          >
            <Plus className="w-4 h-4" />
            Add Commitment
          </button>
        </div>

        {/* Commitments Grid */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : commitments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No commitments yet. Click "Add Commitment" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commitments.map((commitment) => {
              const nextDeduction = calculateNextDeduction(commitment.deductionDate);
              const remainingMonths = calculateRemainingMonths(commitment.endDate);

              return (
                <div
                  key={commitment.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  data-testid={`commitment-${commitment.id}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{commitment.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getTypeColor(commitment.type)}`}>
                        {commitment.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(commitment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-testid={`edit-commitment-${commitment.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(commitment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`delete-commitment-${commitment.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(commitment.amount)}</p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Next deduction: {formatDate(nextDeduction)}</span>
                    </div>
                    {commitment.lastDeductedAt && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>Last deducted: {formatDate(commitment.lastDeductedAt)}</span>
                      </div>
                    )}
                    {remainingMonths !== null && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">{remainingMonths} months remaining</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      {commitment.reminderEnabled ? (
                        <>
                          <Bell className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Reminder ON</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Reminder OFF</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Commitment' : 'Add Commitment'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., Car EMI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="commitment-name-input"
                />
                <p className="text-xs text-gray-500 mt-1">Must be unique</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="commitment-type-select"
                >
                  {COMMITMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="commitment-amount-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Deduction Date *</label>
                <input
                  type="number"
                  name="deductionDate"
                  value={formData.deductionDate}
                  onChange={handleFormChange}
                  required
                  min="1"
                  max="31"
                  placeholder="Day of month (1-31)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="commitment-deduction-date-input"
                />
                <p className="text-xs text-gray-500 mt-1">Day of the month (1-31)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="commitment-end-date-input"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for ongoing commitments</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onChange={handleFormChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  data-testid="commitment-reminder-toggle"
                />
                <label className="text-sm font-medium text-gray-700">Enable Reminder</label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                data-testid="submit-commitment-button"
              >
                {editingId ? 'Update Commitment' : 'Add Commitment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Commitments;
