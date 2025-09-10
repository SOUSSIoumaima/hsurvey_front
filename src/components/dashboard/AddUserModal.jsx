import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { UserPlus, X, User, Mail, Lock } from "lucide-react";
import InputField from "../common/InputField";
import Button from "../common/Button";
import { apiService } from '../../services/apiService';

const AddUserModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
     
      await apiService.addUser(form);
      setForm({ username: "", email: "", password: "" });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error adding user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative transform transition-all duration-300 scale-100 animate-slide-up border border-gray-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Add New User</h3>
            <p className="text-gray-600 mt-1">
              Create a new user account for your team
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User className="w-4 h-4 text-gray-500" />
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 font-medium transition-all duration-200 hover:border-blue-300"
                placeholder="Enter username"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Mail className="w-4 h-4 text-gray-500" />
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 font-medium transition-all duration-200 hover:border-blue-300"
                placeholder="Enter email address"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Lock className="w-4 h-4 text-gray-500" />
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 font-medium transition-all duration-200 hover:border-blue-300"
                placeholder="Enter password"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              label="Cancel"
              className="flex-1 py-3 text-base font-medium hover:bg-gray-100 transition-colors duration-200"
            />
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              label="Add User"
              className="flex-1 py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            />
          </div>
        </form>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AddUserModal;