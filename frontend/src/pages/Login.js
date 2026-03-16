import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { Wallet, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Default admin account (for testing without backend)
    if (formData.phone === 'admin' && formData.password === 'admin@123') {
      const mockAdminUser = {
        id: 'admin-1',
        fullName: 'Admin User',
        phone: 'admin',
        email: 'admin@paisa.com',
        role: 'admin',
        walletBalance: 100000,
      };
      const mockToken = 'mock-jwt-token-admin-' + Date.now();
      login(mockToken, mockAdminUser);
      navigate('/');
      return;
    }

    // Default regular user account (for testing without backend)
    if (formData.phone === 'user' && formData.password === 'user@123') {
      const mockRegularUser = {
        id: 'user-1',
        fullName: 'Regular User',
        phone: 'user',
        email: 'user@paisa.com',
        role: 'user',
        walletBalance: 50000,
      };
      const mockToken = 'mock-jwt-token-user-' + Date.now();
      login(mockToken, mockRegularUser);
      navigate('/');
      return;
    }

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Wallet className="w-10 h-10 text-blue-600" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Pai$@ Management</h1>
            <p className="text-sm text-gray-600">Welcome back!</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" data-testid="error-message">
            {error}
          </div>
        )}

        {/* Default Credentials Info Box */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <p className="text-sm font-semibold text-blue-800 mb-2">🔑 Default Test Accounts:</p>
          <div className="space-y-1 text-xs text-blue-700">
            <div className="flex justify-between items-center bg-white p-2 rounded">
              <span className="font-medium">Admin Account:</span>
              <span className="font-mono">admin / admin@123</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded">
              <span className="font-medium">Regular User:</span>
              <span className="font-mono">user / user@123</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2 italic">
            * Use these credentials to test without backend
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="9876543210 or 'admin'"
              data-testid="phone-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-6"
            data-testid="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
