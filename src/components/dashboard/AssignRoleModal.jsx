import React, { useEffect, useState } from 'react';
import { X, Shield, Users } from 'lucide-react';
import { apiService } from '../../services/apiService';
import Button from '../common/Button';
import { useSelector } from 'react-redux';

const AssignRoleModal = ({ open, user, onClose, onSuccess }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    if (open) {
      apiService.getRoles().then((allRoles) => {
        setRoles(allRoles);
       
        if (user?.roles && Array.isArray(user.roles)) {
          const assignedRoleIds = allRoles
            .filter(r => user.roles.includes(r.id) || user.roles.includes(r.name))
            .map(r => r.id);
          setSelectedRoles(assignedRoleIds);
        } else {
          setSelectedRoles([]);
        }
      }).catch(() => setRoles([]));
      apiService.getDepartments().then((allDepartments) => {
        setDepartments(allDepartments);
        setSelectedDepartment(user?.departmentId || '');
      }).catch(() => setDepartments([]));
    }
  }, [open, user]);

  const handleRoleChange = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Use IDs for current roles
      const currentRoleIds = roles
        .filter(r => (user.roles || []).includes(r.id) || (user.roles || []).includes(r.name))
        .map(r => r.id);
      const toAdd = selectedRoles.filter((r) => !currentRoleIds.includes(r));
      const toRemove = currentRoleIds.filter((r) => !selectedRoles.includes(r));
      const promises = [
        ...toAdd.map((roleId) => apiService.assignRoleToUser(user.id, roleId)),
        ...toRemove.map((roleId) => apiService.removeRoleFromUser(user.id, roleId)),
      ];
      // Department logic
      const prevDeptId = user.departmentId || user.department || '';
      if (selectedDepartment && selectedDepartment !== prevDeptId) {
        // Assign to new department
        promises.push(apiService.assignUserToDepartment(selectedDepartment, user.id));
        // Remove from previous department if existed
        if (prevDeptId) {
          promises.push(apiService.removeUserFromDepartment(prevDeptId, user.id));
        }
      } else if (!selectedDepartment && prevDeptId) {
        // Remove from department if unassigned
        promises.push(apiService.removeUserFromDepartment(prevDeptId, user.id));
      }
      await Promise.all(promises);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to update roles or department.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
      'Manager': 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      'User': 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      'default': 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
    };
    return colors[role.name] || colors.default;
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative transform transition-all duration-300 scale-100 animate-slide-up border border-gray-100 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">
              {user.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              Assign Roles & Department
            </h3>
            <p className="text-gray-600 mt-1">
              Managing permissions for <span className="font-semibold text-gray-800">{user.username}</span>
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Roles Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-500" />
              <h4 className="text-lg font-semibold text-gray-800">User Roles</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select roles to assign permissions. Check to assign, uncheck to remove.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No roles available</p>
                </div>
              )}
              
              {roles.map((role) => (
                <label 
                  key={role.id} 
                  className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
                    selectedRoles.includes(role.id) 
                      ? 'border-purple-300 bg-purple-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleChange(role.id)}
                    className="form-checkbox w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2 mr-4"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 text-lg">{role.name}</span>
                    {role.description && (
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    )}
                  </div>
                  {selectedRoles.includes(role.id) && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Department Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-500" />
              <h4 className="text-lg font-semibold text-gray-800">Department Assignment</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Assign the user to a department for organizational purposes.
            </p>
            
            <div className="relative">
              <select
                id="department-select"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 font-medium transition-all duration-200 appearance-none cursor-pointer hover:border-blue-300"
              >
                <option value="">No department assigned</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept._id || dept.name} value={dept.id || dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
              label="Save Changes"
              className="flex-1 py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
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

export default AssignRoleModal;