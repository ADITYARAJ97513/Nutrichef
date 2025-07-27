import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Package, Calendar, AlertTriangle, Crown, ChefHat, ExternalLink } from 'lucide-react';
import NutriFitBadge from '../../pages/Dashboard/NutriFitBadge';
const getPantryItemStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); 

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    if (expiry < today) {
        return { text: 'Expired', color: 'bg-red-100 text-red-700' };
    }
    if (expiry <= threeDaysFromNow) {
        return { text: 'Expiring Soon', color: 'bg-amber-100 text-amber-700' };
    }
    return null; 
};


const Dashboard = () => {
    const { user } = useAuth();
    const {
        dashboardStats,
        pantryItems,
        loading,
    } = useData();

    const isPro = user?.role === 'pro_user' || user?.role === 'admin';

    if (loading && !dashboardStats) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const StatCard = ({ icon, label, value, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color.bg}`}>
                    {React.cloneElement(icon, { className: `h-6 w-6 ${color.text}` })}
                </div>
                <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    <p className="text-sm text-slate-500">{label}</p>
                </div>
            </div>
        </div>
    );
    
    const statCardsData = [
        { icon: <Package />, label: 'Pantry Items', value: dashboardStats?.pantryItems || 0, color: { bg: 'bg-blue-100', text: 'text-blue-600' } },
        { icon: <AlertTriangle />, label: 'Expiring Soon', value: dashboardStats?.expiringItems || 0, color: { bg: 'bg-rose-100', text: 'text-rose-600' } },
        { icon: <ChefHat />, label: 'Recipes Found', value: dashboardStats?.recipesGenerated || 0, color: { bg: 'bg-amber-100', text: 'text-amber-600' } },
        { icon: <Calendar />, label: 'Meals Planned', value: dashboardStats?.mealsPlanned || 0, color: { bg: 'bg-green-100', text: 'text-green-600' } },
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                Welcome back, {user?.name}! 👋
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Here's your kitchen's status at a glance.
                            </p>
                        </div>
                        {isPro && (
                            <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full border border-amber-200">
                                <Crown className="h-5 w-5" />
                                <span className="text-sm font-semibold">Pro Member</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCardsData.map(card => <StatCard key={card.label} {...card} />)}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Pantry Items */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-slate-800">Recent Pantry Items</h2>
                            <a href="/pantry" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1">
                                <span>View all</span>
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                        {pantryItems && pantryItems.length > 0 ? (
                            <div className="flow-root">
                                <ul className="divide-y divide-slate-100">
                                    {pantryItems.slice(0, 5).map((item) => {
                                        const status = getPantryItemStatus(item.expiryDate);
                                        return (
                                            <li key={item._id} className="py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-800 truncate">{item.name}</p>
                                                        <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-slate-500">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                                                        {status && (
                                                            <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                                                                {status.text}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-800">Your pantry is empty</h3>
                                <p className="text-slate-500 mt-1 mb-4">Start by adding your first ingredient!</p>
                                <a href="/pantry" className="inline-block bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-primary-700 transition-colors">
                                    Add Items
                                </a>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-8">
                         {isPro && (
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <NutriFitBadge />
                            </div>
                        )}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <a href="/pantry" className="flex items-center space-x-3 w-full p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <Package className="h-5 w-5 text-primary-600" />
                                    <span className="font-medium text-slate-700">Manage Pantry</span>
                                </a>
                                <a href="/recipes" className="flex items-center space-x-3 w-full p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <ChefHat className="h-5 w-5 text-primary-600" />
                                    <span className="font-medium text-slate-700">Find Recipes</span>
                                </a>
                                <a href="/meal-planner" className="flex items-center space-x-3 w-full p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <Calendar className="h-5 w-5 text-primary-600" />
                                    <span className="font-medium text-slate-700">Plan Meals</span>
                                </a>
                                {!isPro && (
                                    <a href="/payment" className="flex items-center space-x-3 w-full p-4 rounded-lg bg-amber-100 border-2 border-amber-200 hover:bg-amber-200 transition-colors">
                                        <Crown className="h-5 w-5 text-amber-600" />
                                        <span className="font-semibold text-amber-800">Upgrade to Pro</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;