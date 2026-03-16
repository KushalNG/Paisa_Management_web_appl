import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  Calendar,
  User,
  Users,
  LogOut,
  Wallet,
  PiggyBank,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/budgets', icon: PiggyBank, label: 'Budget Management' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/commitments', icon: Calendar, label: 'Commitments' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (isAdmin()) {
    navItems.push({ path: '/admin', icon: Users, label: 'Admin Panel' });
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-blue-500">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Pai$@ Management</h1>
            <p className="text-xs text-blue-200">Expense Tracker</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-blue-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.fullName}</p>
            <p className="text-xs text-blue-200">{user?.role === 'admin' ? 'Admin' : 'User'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'bg-white text-blue-600 font-semibold shadow-lg'
                  : 'hover:bg-blue-700 text-blue-100'
                }`
              }
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-500">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full hover:bg-blue-700 transition-all text-blue-100"
          data-testid="logout-button"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
