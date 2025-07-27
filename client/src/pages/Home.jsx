import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Clock, Users, Crown, Check } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-100 py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Smart Kitchen <span className="text-primary-600">Management</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your cooking experience with AI-powered meal planning, smart pantry management, and personalized nutrition guidance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md transition"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-xl text-lg font-semibold border border-gray-300 shadow-sm transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need for Smart Cooking
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From pantry management to AI-powered meal planning, we've got you covered.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Pantry</h3>
              <p className="text-gray-600 text-base">
                Track ingredients, expiry dates, and get alerts before food spoils.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Meal Planning</h3>
              <p className="text-gray-600 text-base">
                AI-powered weekly meal plans based on your preferences and goals.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recipe Suggestions</h3>
              <p className="text-gray-600 text-base">
                Get personalized recipe recommendations based on available ingredients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade when you're ready for more features.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md hover:shadow-xl transition">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Free</h3>
                <p className="text-4xl font-extrabold text-gray-900">₹0</p>
                <p className="text-gray-600 mt-1">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 text-gray-700 text-sm mb-8">
                {[
                  ' pantry management',
                  'Expiry date alerts',
                  'Manual meal planning',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check className="text-green-500 w-5 h-5 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-xl block text-center transition"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-300 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center shadow">
                  <Crown className="h-4 w-4 mr-1" />
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8 mt-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Pro</h3>
                <p className="text-4xl font-extrabold text-gray-900">₹9.99</p>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-3 text-gray-700 text-sm mb-8">
                {[
                  'Everything in Free',
                  'AI-powered meal planning',
                  // 'Personalized nutrition tracking',
                  'AI-powered recipe generation',
                  'Recipe catalog from other pro users',
                  'Advanced analytics & reports',
                  'PDF meal plan exports',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check className="text-green-500 w-5 h-5 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl block text-center transition"
              >
                Start Pro Membership
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
