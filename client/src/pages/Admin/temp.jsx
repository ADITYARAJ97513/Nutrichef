import React, { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, Ban, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    totalRecipes: 0,
    totalRevenue: 0,
    recentUsers: [],
    recentSubscriptions: [],
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await axios.post(`/api/admin/users/${userId}/${action}`);
      toast.success(`User ${action}ned successfully`);
      fetchAdminStats();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage users, subscriptions, and content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard Icon={Users} value={stats.totalUsers} label="Total Users" color="blue" />
        <StatCard Icon={Users} value={stats.proUsers} label="Pro Users" color="accent" />
        <StatCard Icon={Package} value={stats.totalRecipes} label="Total Recipes" color="green" />
        <StatCard Icon={DollarSign} value={`$${stats.totalRevenue}`} label="Revenue" color="purple" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'subscriptions', name: 'Subscriptions', icon: DollarSign },
              { id: 'recipes', name: 'Recipes', icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && <UsersTab users={stats.recentUsers} handleAction={handleUserAction} />}
          {activeTab === 'subscriptions' && <SubscriptionsTab stats={stats} />}
          {activeTab === 'recipes' && <RecipeTab />}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ Icon, value, label, color }) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`bg-${color}-100 p-3 rounded-lg`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="ml-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);

const OverviewTab = ({ stats }) => (
  <div className="grid lg:grid-cols-2 gap-8">
    <RecentUsers users={stats.recentUsers} />
    <RecentSubscriptions subs={stats.recentSubscriptions} />
  </div>
);

const RecentUsers = ({ users }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
    <div className="space-y-4">
      {users.slice(0, 5).map((user) => (
        <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${
              user.role === 'pro_user' ? 'text-accent-600' : 'text-gray-600'
            }`}>
              {user.role.replace('_', ' ')}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RecentSubscriptions = ({ subs }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscriptions</h3>
    <div className="space-y-4">
      {subs.slice(0, 5).map((sub, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{sub.userEmail}</p>
              <p className="text-sm text-gray-600">{sub.plan} Plan</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">
              ${sub.amount}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(sub.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UsersTab = ({ users, handleAction }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'pro_user' 
                    ? 'bg-accent-100 text-accent-800'
                    : user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status || 'active'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onClick={() => handleAction(user._id, 'ban')} className="text-red-600 hover:text-red-900">
                  <Ban className="h-4 w-4" />
                </button>
                <button onClick={() => handleAction(user._id, 'promote')} className="text-blue-600 hover:text-blue-900">
                  <CheckCircle className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SubscriptionsTab = ({ stats }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Management</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-4">Subscription Stats</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Subscriptions:</span>
            <span className="font-medium">
              {stats.recentSubscriptions.filter(s => s.plan === 'monthly').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Yearly Subscriptions:</span>
            <span className="font-medium">
              {stats.recentSubscriptions.filter(s => s.plan === 'yearly').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Revenue:</span>
            <span className="font-medium text-green-600">${stats.totalRevenue}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h4 className="font-semibold text-gray-900 mb-4">Recent Payments</h4>
        <div className="space-y-3">
          {stats.recentSubscriptions.slice(0, 5).map((sub, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{sub.userEmail}</p>
                <p className="text-xs text-gray-500">{sub.plan} plan</p>
              </div>
              <span className="text-sm font-medium text-green-600">
                ${sub.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RecipeTab = () => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Management</h3>
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">Recipe Management</h4>
      <p className="text-gray-600">
        Recipe management features will be available in the next update.
      </p>
    </div>
  </div>
);

export default AdminDashboard;
