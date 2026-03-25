import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { transactionAPI } from '@/services/api';
import { formatCurrency, formatDate, exportToCSV } from '@/utils/exportUtils';
import { getAllCategories, addCustomCategory } from '@/utils/categories';
import { Plus, X, Download, Filter, TrendingDown, TrendingUp } from 'lucide-react';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('spend'); // 'spend' or 'receive'
  const [showForm, setShowForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    type: 'spend',
    category: '',
    reason: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  // Export state
  const [exportOptions, setExportOptions] = useState({
    startDate: '',
    endDate: '',
    category: '',
    format: 'csv',
  });

  useEffect(() => {
    fetchTransactions();
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(getAllCategories());
  };

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Mock data
      setTransactions([
        { id: 1, type: 'spend', category: 'Food & Dining', amount: 450, date: '2025-03-10', description: 'Lunch at cafe' },
        { id: 2, type: 'receive', reason: 'Salary', amount: 50000, date: '2025-03-01' },
        { id: 3, type: 'spend', category: 'Transportation', amount: 200, date: '2025-03-09', description: 'Uber ride' },
        { id: 4, type: 'spend', category: 'Shopping', amount: 2500, date: '2025-03-08', description: 'New shoes' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category || t.reason === filters.category);
    }
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }
    if (filters.minAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(filters.maxAmount));
    }

    setFilteredTransactions(filtered);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        type: activeTab,
        amount: parseFloat(formData.amount),
      };
      await transactionAPI.create(data);
      await fetchTransactions();
      setShowForm(false);
      setFormData({
        type: activeTab,
        category: '',
        reason: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction');
    }
  };

  const handleAddCategory = () => {
    if (newCategory && newCategory.trim()) {
      try {
        const added = addCustomCategory(newCategory.trim());
        loadCategories();
        setFormData({ ...formData, category: added });
        setNewCategory('');
        setShowAddCategory(false);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (exportOptions.startDate) params.startDate = exportOptions.startDate;
      if (exportOptions.endDate) params.endDate = exportOptions.endDate;
      if (exportOptions.category) params.category = exportOptions.category;
      params.format = 'csv';

      const response = await transactionAPI.export(params);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Export failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" data-testid="transactions-title">Transactions</h1>
            <p className="text-gray-600">Manage your income and expenses</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              data-testid="export-button"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="add-transaction-button"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="∞"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'receive' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'receive' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {transaction.category || transaction.reason}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                      )}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.type === 'receive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'receive' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Transaction</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveTab('spend');
                  setFormData({ ...formData, type: 'spend' });
                }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'spend'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid="spend-tab"
              >
                Spend
              </button>
              <button
                onClick={() => {
                  setActiveTab('receive');
                  setFormData({ ...formData, type: 'receive' });
                }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'receive'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid="receive-tab"
              >
                Receive
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'spend' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    {!showAddCategory ? (
                      <div className="flex gap-2">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          data-testid="category-select"
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddCategory(true)}
                          className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCategory(false)}
                          className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., Salary, Freelance, Gift"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    data-testid="reason-input"
                  />
                </div>
              )}

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
                  data-testid="amount-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="date-input"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                data-testid="submit-transaction-button"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Export Transactions</h2>
              <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={exportOptions.startDate}
                  onChange={(e) => setExportOptions({ ...exportOptions, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={exportOptions.endDate}
                  onChange={(e) => setExportOptions({ ...exportOptions, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={exportOptions.category}
                  onChange={(e) => setExportOptions({ ...exportOptions, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <div className="flex gap-3">
                  <div className="flex-1 py-2 rounded-lg font-semibold bg-blue-600 text-white text-center">
                    CSV
                  </div>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                data-testid="confirm-export-button"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Transactions;
