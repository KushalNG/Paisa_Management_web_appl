import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dashboardAPI } from '@/services/api';
import { formatCurrency, getBudgetColor } from '@/utils/exportUtils';
import { getAllCategories } from '@/utils/categories';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Edit2, Save, X, PiggyBank, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const BudgetManagement = () => {
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [categoryComparison, setCategoryComparison] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    budgetAmount: '',
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getBudgets();
      setBudgets(response.data);
      prepareChartData(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      // Mock data for demonstration
      const mockBudgets = [
        { category: 'Food & Dining', budget: 15000, spent: 12500 },
        { category: 'Transportation', budget: 10000, spent: 8500 },
        { category: 'Shopping', budget: 5000, spent: 6500 },
        { category: 'Entertainment', budget: 5000, spent: 4500 },
        { category: 'Bills & Utilities', budget: 8000, spent: 7769.50 },
        { category: 'Healthcare', budget: 3000, spent: 1200 },
      ];
      setBudgets(mockBudgets);
      prepareChartData(mockBudgets);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (budgetData) => {
    const chartData = budgetData.map(b => ({
      category: b.category,
      Budget: b.budget,
      Actual: b.spent,
    }));
    setCategoryComparison(chartData);
  };

  const handleAddBudget = () => {
    setShowAddForm(true);
    setEditingCategory(null);
    setFormData({ category: '', budgetAmount: '' });
  };

  const handleEditBudget = (budget) => {
    setEditingCategory(budget.category);
    setFormData({
      category: budget.category,
      budgetAmount: budget.budget.toString(),
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        category: formData.category,
        budgetAmount: parseFloat(formData.budgetAmount),
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
      };

      // API call would go here
      // await budgetAPI.createOrUpdate(data);

      // Mock update for now
      const existingIndex = budgets.findIndex(b => b.category === formData.category);
      let updatedBudgets;
      
      if (existingIndex >= 0) {
        // Update existing
        updatedBudgets = [...budgets];
        updatedBudgets[existingIndex] = {
          ...updatedBudgets[existingIndex],
          budget: parseFloat(formData.budgetAmount),
        };
      } else {
        // Add new
        updatedBudgets = [...budgets, {
          category: formData.category,
          budget: parseFloat(formData.budgetAmount),
          spent: 0,
        }];
      }

      setBudgets(updatedBudgets);
      prepareChartData(updatedBudgets);
      setShowAddForm(false);
      setFormData({ category: '', budgetAmount: '' });
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ category: '', budgetAmount: '' });
  };

  const getAvailableCategories = () => {
    const usedCategories = budgets.map(b => b.category);
    return getAllCategories().filter(cat => !usedCategories.includes(cat));
  };

  const calculateTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.budget, 0);
  };

  const calculateTotalSpent = () => {
    return budgets.reduce((sum, b) => sum + b.spent, 0);
  };

  const getOverallStatus = () => {
    const total = calculateTotalBudget();
    const spent = calculateTotalSpent();
    const percentage = (spent / total) * 100;

    if (percentage < 70) return { color: 'green', status: 'Excellent', icon: CheckCircle };
    if (percentage < 90) return { color: 'yellow', status: 'Good', icon: AlertCircle };
    return { color: 'red', status: 'Critical', icon: TrendingDown };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading budgets...</div>
        </div>
      </Layout>
    );
  }

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800" data-testid="budget-management-title">
              Budget Management
            </h1>
            <p className="text-gray-600">Set spending limits and track your budget progress</p>
          </div>
          <button
            onClick={handleAddBudget}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="add-budget-button"
          >
            <Plus className="w-4 h-4" />
            Set Budget
          </button>
        </div>

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(calculateTotalBudget())}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(calculateTotalSpent())}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Status</p>
                <p className={`text-2xl font-bold mt-1 ${
                  overallStatus.color === 'green' ? 'text-green-600' :
                  overallStatus.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {overallStatus.status}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                overallStatus.color === 'green' ? 'bg-green-100' :
                overallStatus.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <StatusIcon className={`w-6 h-6 ${
                  overallStatus.color === 'green' ? 'text-green-600' :
                  overallStatus.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 How to Use Budget Management:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Click <strong>"Set Budget"</strong> to add a spending limit for any category</li>
                <li>Budgets are per month - spent amount resets on the 1st of each month</li>
                <li>The system automatically tracks your spending and calculates percentages</li>
                <li>Edit budgets anytime to adjust your spending limits</li>
                <li>Colors: 🟢 Green (0-69%) | 🟡 Yellow (70-89%) | 🔴 Red (90-100%+)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Budget vs Actual Chart */}
        {budgets.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Budget vs Actual Spending</h3>
              <p className="text-sm text-gray-600 mt-1">
                Compare your planned budget with actual spending across all categories
              </p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryComparison} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120} 
                  fontSize={12}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-gray-700">Budget (Planned)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-gray-700">Actual (Spent)</span>
              </div>
            </div>
          </div>
        )}

        {/* Budget Progress Tracker */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Progress Tracker</h3>
          
          {budgets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">No budgets set yet</p>
              <p className="text-sm mb-4">Start by setting a budget for your spending categories</p>
              <button
                onClick={handleAddBudget}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Set Your First Budget
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget, idx) => {
                const percentage = (budget.spent / budget.budget) * 100;
                const isOverBudget = percentage > 100;
                const remaining = budget.budget - budget.spent;

                return (
                  <div 
                    key={idx} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`budget-item-${budget.category}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-base font-semibold text-gray-800">{budget.category}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: {formatCurrency(budget.budget)} | 
                          Spent: {formatCurrency(budget.spent)} | 
                          {remaining >= 0 ? (
                            <span className="text-green-600"> Remaining: {formatCurrency(remaining)}</span>
                          ) : (
                            <span className="text-red-600"> Over by: {formatCurrency(Math.abs(remaining))}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverBudget && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                            Over Budget!
                          </span>
                        )}
                        <button
                          onClick={() => handleEditBudget(budget)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Budget"
                          data-testid={`edit-budget-${budget.category}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-semibold ${getBudgetColor(percentage)}`}>
                          {percentage.toFixed(1)}% used
                        </span>
                        <span className="text-gray-600">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded-full transition-all flex items-center justify-end pr-2 ${
                            percentage >= 90 ? 'bg-red-500' : 
                            percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                          {percentage >= 20 && (
                            <span className="text-xs font-semibold text-white">
                              {percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Budget Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Budget' : 'Set New Budget'}
              </h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                {editingCategory ? (
                  <input
                    type="text"
                    value={formData.category}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    data-testid="category-select"
                  >
                    <option value="">Select Category</option>
                    {getAvailableCategories().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Choose the spending category you want to set a budget for
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  required
                  min="1"
                  step="1"
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="budget-amount-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum amount you plan to spend in this category this month
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Set realistic budgets based on your income and past spending. 
                  You can always adjust them later!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="cancel-budget-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  data-testid="save-budget-button"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Update Budget' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BudgetManagement;
