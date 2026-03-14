import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { adminAPI } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/exportUtils';
import { Users, Eye, Edit2, Trash2, Key, X } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data
      setUsers([
        {
          id: 1,
          fullName: 'John Doe',
          phone: '9876543210',
          email: 'john@example.com',
          role: 'user',
          walletBalance: 45230.50,
          createdAt: '2025-01-15',
        },
        {
          id: 2,
          fullName: 'Jane Smith',
          phone: '9876543211',
          email: 'jane@example.com',
          role: 'user',
          walletBalance: 32150.00,
          createdAt: '2025-02-01',
        },
        {
          id: 3,
          fullName: 'Admin User',
          phone: '9999999999',
          email: 'admin@example.com',
          role: 'admin',
          walletBalance: 100000.00,
          createdAt: '2025-01-01',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const response = await adminAPI.getUserDetail(userId);
      setSelectedUser(response.data);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      // Mock detailed data
      const user = users.find(u => u.id === userId);
      setSelectedUser({
        ...user,
        transactions: [
          { id: 1, type: 'spend', category: 'Food & Dining', amount: 450, date: '2025-03-10' },
          { id: 2, type: 'receive', reason: 'Salary', amount: 50000, date: '2025-03-01' },
        ],
        commitments: [
          { id: 1, name: 'Car EMI', type: 'EMI', amount: 15000, deductionDate: 5 },
        ],
        stats: {
          totalIncome: 85000,
          totalExpense: 39769.50,
          transactionCount: 45,
          commitmentCount: 3,
        },
      });
    }
    setShowUserDetail(true);
  };

  const handleEditUser = (user) => {
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminAPI.updateUser(selectedUser.id, editFormData);
      await fetchUsers();
      setShowEditModal(false);
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminAPI.deleteUser(userId);
        await fetchUsers();
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await adminAPI.resetPassword(selectedUser.id, { newPassword });
      setShowResetPasswordModal(false);
      setNewPassword('');
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800" data-testid="admin-panel-title">Admin Panel</h1>
          <p className="text-gray-600">Manage all users and their accounts</p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {users.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50" data-testid={`user-row-${user.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-medium text-gray-800">{user.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">{user.phone}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        {formatCurrency(user.walletBalance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => fetchUserDetail(user.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                            data-testid={`view-user-${user.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit User"
                            data-testid={`edit-user-${user.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowResetPasswordModal(true);
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Reset Password"
                            data-testid={`reset-password-${user.id}`}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                            data-testid={`delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
              <button onClick={() => setShowUserDetail(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(selectedUser.walletBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedUser.stats?.totalIncome || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expense</p>
                  <p className="font-semibold text-red-600">{formatCurrency(selectedUser.stats?.totalExpense || 0)}</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {selectedUser.transactions?.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{txn.category || txn.reason}</p>
                      <p className="text-sm text-gray-600">{formatDate(txn.date)}</p>
                    </div>
                    <p className={`font-bold ${txn.type === 'receive' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'receive' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Commitments</h3>
              <div className="space-y-2">
                {selectedUser.commitments?.map(commit => (
                  <div key={commit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{commit.name}</p>
                      <p className="text-sm text-gray-600">{commit.type} - Deducts on {commit.deductionDate}th</p>
                    </div>
                    <p className="font-bold text-gray-800">{formatCurrency(commit.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="edit-fullname-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="edit-email-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="edit-role-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                onClick={handleSaveEdit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                data-testid="save-edit-button"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
              <button onClick={() => setShowResetPasswordModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Reset password for <span className="font-semibold">{selectedUser?.fullName}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="new-password-input"
                />
              </div>
              <button
                onClick={handleResetPassword}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                data-testid="confirm-reset-password-button"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminPanel;
