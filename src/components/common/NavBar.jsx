import React, { useState } from 'react';
import { LogOut, User, Building, ChevronDown, Bell, Settings, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to get user role display
  const getUserRoleDisplay = () => {
    if (!user) return 'user';
    
    // Check if user has roles array
    if (user.roles && Array.isArray(user.roles)) {
      // Return the first role found (or you can join multiple roles)
      return user.roles[0] || 'user';
    }
    
    // Check if user has a direct role property (fallback)
    if (user.role) {
      return user.role;
    }
    
    // Default fallback
    return 'user';
  };

  const userRoleDisplay = getUserRoleDisplay();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
     
      navigate('/');
      setIsUserMenuOpen(false);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsUserMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img src="/Hsurveys.png" alt="H Surveys Logo" className="w-6 h-6 object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                H Surveys
              </h1>
              <p className="text-xs text-gray-500 font-medium">Welcome back, {user?.username}!</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  3
                </span>
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-2 rounded-full shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-left hidden sm:block">
                  <p className="font-semibold text-gray-800">{user?.username || 'User'}</p>
                  <p className="text-gray-500 capitalize text-xs font-medium">{userRoleDisplay}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span>View Profile</span>
                  </button>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>Settings</span>
                  </button>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {/* Mobile menu content can be added here if needed */}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default NavBar;