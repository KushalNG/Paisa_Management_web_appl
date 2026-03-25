import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { dashboardAPI } from '@/services/api';
import { formatCurrency } from '@/utils/exportUtils';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { getCategoryColor } from '@/utils/categories';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [monthRange, setMonthRange] = useState({ start: '', end: '' });
  const [filterMode, setFilterMode] = useState('current'); // current | single | range
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    categoryExpenses: [],
    upcomingCommitments: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, monthRange, filterMode]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {};
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (filterMode === 'range' && (monthRange.start || monthRange.end)) {
        if (monthRange.start) {
          params.startDate = `${monthRange.start}-01`;
        }
        if (monthRange.end) {
          const [y, m] = monthRange.end.split('-').map(Number);
          const lastDay = new Date(y, m, 0).getDate();
          params.endDate = `${monthRange.end}-${String(lastDay).padStart(2, '0')}`;
        }
      } else if (filterMode === 'single') {
        params.month = selectedMonth || currentMonth;
      } else {
        params.month = currentMonth;
      }
      const response = await dashboardAPI.getStats(params);
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
        upcomingCommitments: [
          { name: 'Car EMI', amount: 15000, dueDate: '2025-03-15' },
          { name: 'Netflix Subscription', amount: 799, dueDate: '2025-03-14' },
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700">Filter Mode</label>
            <select
              value={filterMode}
              onChange={(e) => {
                const value = e.target.value;
                setFilterMode(value);
                if (value !== 'range') setMonthRange({ start: '', end: '' });
                if (value === 'current') setSelectedMonth(new Date().toISOString().slice(0, 7));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="current">Current Month</option>
              <option value="single">Single Month</option>
              <option value="range">Month Range</option>
            </select>
          </div>

          {filterMode === 'single' && (
            <div className="flex flex-col">
              <label className="text-sm text-gray-700">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {filterMode === 'range' && (
            <>
              <div className="flex flex-col">
                <label className="text-sm text-gray-700">Start Month</label>
                <input
                  type="month"
                  value={monthRange.start}
                  onChange={(e) => setMonthRange({ ...monthRange, start: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-700">End Month</label>
                <input
                  type="month"
                  value={monthRange.end}
                  onChange={(e) => setMonthRange({ ...monthRange, end: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          )}
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

        {/* Quick Action Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">💡 Manage Your Budget</h3>
          <p className="text-blue-100 mb-4">
            Set spending limits and track your budget progress across all categories
          </p>
          <button
            onClick={() => window.location.href = '/budgets'}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Go to Budget Management →
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
