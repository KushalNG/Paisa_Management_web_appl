import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dashboardAPI } from '@/services/api';
import { formatCurrency, getBudgetColor, getBudgetBgColor } from '@/utils/exportUtils';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, Bell } from 'lucide-react';
import { getCategoryColor } from '@/utils/categories';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    categoryExpenses: [],
    trends: [],
    budgets: [],
    upcomingCommitments: [],
    exceededBudgets: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for demonstration
      setStats({
        walletBalance: 45230.50,
        totalIncome: 85000,
        totalExpense: 39769.50,
        categoryExpenses: [
          { category: 'Food & Dining', amount: 12500 },
          { category: 'Transportation', amount: 8500 },
          { category: 'Shopping', amount: 6500 },
          { category: 'Entertainment', amount: 4500 },
          { category: 'Bills & Utilities', amount: 7769.50 },
        ],
        trends: [
          { month: 'Jan', 'Food & Dining': 12000, Transportation: 8000, Shopping: 7000 },
          { month: 'Feb', 'Food & Dining': 11500, Transportation: 8500, Shopping: 6500 },
          { month: 'Mar', 'Food & Dining': 12500, Transportation: 8500, Shopping: 6500 },
        ],
        budgets: [
          { category: 'Food & Dining', budget: 15000, spent: 12500 },
          { category: 'Transportation', budget: 10000, spent: 8500 },
          { category: 'Shopping', budget: 5000, spent: 6500 },
          { category: 'Entertainment', budget: 5000, spent: 4500 },
        ],
        upcomingCommitments: [
          { name: 'Car EMI', amount: 15000, dueDate: '2025-03-15' },
          { name: 'Netflix Subscription', amount: 799, dueDate: '2025-03-14' },
        ],
        exceededBudgets: [
          { category: 'Shopping', budget: 5000, spent: 6500, excess: 1500 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800" data-testid="dashboard-title">Dashboard</h1>
          <p className="text-gray-600">Overview of your financial status</p>
        </div>

        {/* Commitment Reminder Banner */}
        {stats.upcomingCommitments.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg" data-testid="commitment-reminder">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Upcoming Commitments</h3>
                {stats.upcomingCommitments.map((commitment, idx) => (
                  <p key={idx} className="text-sm text-yellow-700">
                    {commitment.name} - {formatCurrency(commitment.amount)} due on {new Date(commitment.dueDate).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Budget Exceeded Alerts */}
        {stats.exceededBudgets.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg" data-testid="budget-alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Budget Exceeded</h3>
                {stats.exceededBudgets.map((budget, idx) => (
                  <p key={idx} className="text-sm text-red-700">
                    {budget.category}: Exceeded by {formatCurrency(budget.excess)} (Budget: {formatCurrency(budget.budget)}, Spent: {formatCurrency(budget.spent)})
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6" data-testid="wallet-balance-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.walletBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6" data-testid="income-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalIncome)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6" data-testid="expense-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expense</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.totalExpense)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Expenses Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category-wise Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3b82f6">
                  {stats.categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Expenses Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryExpenses}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.category}
                >
                  {stats.categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Food & Dining" stroke="#FF6384" strokeWidth={2} />
              <Line type="monotone" dataKey="Transportation" stroke="#36A2EB" strokeWidth={2} />
              <Line type="monotone" dataKey="Shopping" stroke="#FFCE56" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Progress Bars */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Progress</h3>
          <div className="space-y-4">
            {stats.budgets.map((budget, idx) => {
              const percentage = (budget.spent / budget.budget) * 100;
              return (
                <div key={idx} data-testid={`budget-${budget.category}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                    <span className={`text-sm font-semibold ${getBudgetColor(percentage)}`}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
