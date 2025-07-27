import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Menu, X, User, LogOut, Settings, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isPro = user?.role === 'pro_user' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">NutriChef</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/pantry"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Pantry
                </Link>
                <Link
                  to="/recipes"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Recipes
                </Link>
                <Link
                  to="/meal-planner"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Meal Planner
                </Link>
                {!isPro && (
                  <Link
                    to="/payment"
                    className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-1"
                  >
                    <Crown className="h-4 w-4" />
                    <span>Go Pro</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user.name}</span>
                    {isPro && <Crown className="h-4 w-4 text-accent-500" />}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          // Navigate to profile settings
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/pantry"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pantry
                </Link>
                <Link
                  to="/recipes"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Recipes
                </Link>
                <Link
                  to="/meal-planner"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meal Planner
                </Link>
                {!isPro && (
                  <Link
                    to="/payment"
                    className="block px-3 py-2 text-accent-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Go Pro
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-primary-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;