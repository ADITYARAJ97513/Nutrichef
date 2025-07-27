import React, { useState, useEffect, useCallback } from 'react';
import { Users, Package, DollarSign, TrendingUp, Ban, CheckCircle, Search, ThumbsUp, ThumbsDown, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    const fetchAdminStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to fetch admin stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminStats();
    }, [fetchAdminStats]);

    if (loading || !stats) {
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
                <p className="text-gray-600 mt-1">Manage users, subscriptions, and revenue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard Icon={Users} value={stats.totalUsers} label="Total Users" color="blue" />
                <StatCard Icon={Users} value={stats.proUsers} label="Pro Users" color="accent" />
                <StatCard Icon={Package} value={stats.totalRecipes} label="Total Recipes" color="green" />
                <StatCard Icon={DollarSign} value={`₹${(stats.totalRevenue || 0).toFixed(2)}`} label="Revenue" color="purple" />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: 'Overview', icon: TrendingUp },
                            { id: 'users', name: 'Users', icon: Users },
                            { id: 'subscriptions', name: 'Subscriptions', icon: DollarSign },
                            // { id: 'recipes', name: 'Recipes', icon: Package },
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
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'subscriptions' && <SubscriptionsTab stats={stats} />}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ Icon, value, label, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscriptions</h3>
            <div className="space-y-4">
                {stats.recentSubscriptions.map((sub, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 capitalize">{sub.plan} Plan</p>
                            <p className="text-sm text-gray-600">Order ID: {sub.razorpayOrderId.slice(0, 12)}...</p>
                        </div>
                        <p className="text-xs text-gray-500">Started: {new Date(sub.startDate).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/users', {
                params: { page, search: searchTerm, limit: 10 }
            });
            setUsers(data.users);
            setTotalPages(data.pages);
        } catch (error) {
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchUsers]);

    
    const handleToggleActive = async (userIdToUpdate, currentIsActive) => {
        // Save the original list in case the API call fails
        const originalUsers = [...users];

        // Update the UI instantly
        const updatedUsers = users.map(user =>
            user._id === userIdToUpdate ? { ...user, isActive: !user.isActive } : user
        );
        setUsers(updatedUsers);

        // Send the request to the backend
        try {
            await axios.post(`/api/admin/users/${userIdToUpdate}/toggle-active`);
            toast.success(`User successfully ${currentIsActive ? 'blocked' : 'unblocked'}.`);
            // On success, we don't need to do anything else because the UI is already updated
        } catch (error) {
            toast.error("Action failed. Reverting change.");
            // If the API call fails, revert the UI back to its original state
            setUsers(originalUsers);
        }
    };
    
    const handlePromote = async (userIdToUpdate) => {
        const originalUsers = [...users];
        const updatedUsers = users.map(user =>
            user._id === userIdToUpdate ? { ...user, role: 'admin' } : user
        );
        setUsers(updatedUsers);

        try {
            await axios.post(`/api/admin/users/${userIdToUpdate}/change-role`, { newRole: 'admin' });
            toast.success("User promoted to admin!");
        } catch (error) {
            toast.error("Failed to promote user. Reverting change.");
            setUsers(originalUsers);
        }
    };
    
    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="input-field pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
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
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                        user.role === 'pro_user' ? 'bg-accent-100 text-accent-800' :
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.isActive ? 'Active' : 'Blocked'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleToggleActive(user._id, user.isActive)} className={user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"} title={user.isActive ? 'Block User' : 'Unblock User'}>
                                        <Ban className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handlePromote(user._id)} className="text-blue-600 hover:text-blue-900" title="Promote to Admin">
                                        <CheckCircle className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                </button>
                <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

const SubscriptionsTab = ({ stats }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscriptions</h3>
        <div className="space-y-4">
            {stats.recentSubscriptions.map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900 capitalize">{sub.plan} Plan</p>
                        <p className="text-sm text-gray-600">Order: {sub.razorpayOrderId}</p>
                    </div>
                    <p className="text-xs text-gray-500">Started: {new Date(sub.startDate).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    </div>
);

export default AdminDashboard;
