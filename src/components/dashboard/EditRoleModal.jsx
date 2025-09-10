import React, { useState, useEffect } from "react";
import { X, Shield, Check, AlertCircle, Edit3 } from "lucide-react";
import Button from "../common/Button";

const EditRoleModal = ({ isOpen, onClose, role, permissions, onSave }) => {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form when role changes
  useEffect(() => {
    if (isOpen && role) {
      setRoleName(role.name || "");
      setRoleDescription(role.description || "");
      setSelectedPermissions(
        Array.isArray(role.permissions)
          ? role.permissions.map(p => typeof p === "object" ? p.id : p)
          : []
      );
      setError("");
    }
  }, [isOpen, role]);

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!roleName.trim()) {
      setError("Role name is required");
      setLoading(false);
      return;
    }
    
    if (!roleDescription.trim()) {
      setError("Role description is required");
      setLoading(false);
      return;
    }
    
    if (selectedPermissions.length === 0) {
      setError("At least one permission must be selected");
      setLoading(false);
      return;
    }

    try {
      await onSave({
        id: role.id,
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: selectedPermissions
      });
      onClose();
    } catch (err) {
      setError(err.message || "Error updating role");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100 animate-slide-up border border-gray-100">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Edit3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Edit Role</h3>
            <p className="text-gray-600 mt-1">
              Update role details for <span className="font-semibold text-gray-800">{role.name}</span>
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Role Name */}
          <div className="space-y-2">
            <label htmlFor="roleName" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Shield className="w-4 h-4 text-gray-500" />
              Role Name
            </label>
            <div className="relative">
              <input
                id="roleName"
                name="roleName"
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-800 font-medium transition-all duration-200 hover:border-indigo-300"
                placeholder="Enter role name"
              />
            </div>
          </div>

          {/* Role Description */}
          <div className="space-y-2">
            <label htmlFor="roleDescription" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              Role Description
            </label>
            <div className="relative">
              <textarea
                id="roleDescription"
                name="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                rows={3}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-800 font-medium transition-all duration-200 hover:border-indigo-300 resize-none"
                placeholder="Enter role description"
              />
            </div>
          </div>

          {/* Permissions Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Check className="w-4 h-4 text-gray-500" />
              Assigned Permissions
            </label>
            <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
              {permissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No permissions available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-white cursor-pointer transition-all duration-200 bg-white shadow-sm"
                    >
                      <input
                        type="checkbox"
                        name="permissions"
                        value={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-800">{permission.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                      </div>
                      {selectedPermissions.includes(permission.id) && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </label>
                  ))}
                </div>
              )}
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
              onClick={handleClose}
              label="Cancel"
              className="flex-1 py-3 text-base font-medium hover:bg-gray-100 transition-colors duration-200"
            />
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              label="Save Changes"
              className="flex-1 py-3 text-base font-medium bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
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

export default EditRoleModal;