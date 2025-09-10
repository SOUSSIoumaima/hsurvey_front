import React, { useState } from "react";
import { Shield, Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import AddRoleModal from "./AddRoleModal";
import EditRoleModal from "./EditRoleModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const RolesSection = ({ roles, permissions, onCreateRole, onEditRole, onDeleteRole }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddRole = (roleData) => {
    onCreateRole(roleData);
  };

  const handleEditRole = (roleData) => {
    onEditRole(roleData);
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await onDeleteRole(selectedRole.id);
      setShowDeleteModal(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedRole(null);
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Compact Header with integrated controls */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Role Management</h2>
              <p className="text-sm text-gray-500">Manage roles and their assigned permissions</p>
            </div>
          </div>
          
          {/* Create Button */}
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </div>
        
        {/* Search Row */}
        <div className="flex flex-col lg:flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-800 text-sm transition-all duration-200 hover:border-purple-300"
              />
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              {filteredRoles.length} of {roles.length} roles
            </span>
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              {roles.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Shield className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? "No roles found" : "No roles created yet"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm ? "Try adjusting your search criteria" : "Create your first role to get started"}
                      </p>
                      {!searchTerm && (
                        <button 
                          onClick={() => setShowAddModal(true)}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <Plus className="w-5 h-5" />
                          Create First Role
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                          <span className="text-white text-sm font-semibold">
                            {role.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{role.name}</div>
                          <div className="text-sm text-gray-500">ID: {role.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {role.description || 'No description provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="bg-purple-50 text-purple-700 text-sm font-medium px-3 py-1 rounded-full border border-purple-200">
                          {role.permissions?.length || 0} permissions
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditClick(role)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 border border-purple-200 hover:border-purple-300"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(role)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300 disabled:opacity-50"
                          disabled={deleteLoading && selectedRole?.id === role.id}
                          title="Delete Role"
                        >
                          {deleteLoading && selectedRole?.id === role.id ? (
                            <div className="w-4 h-4 animate-spin border-2 border-red-400 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        permissions={permissions}
        onSave={handleAddRole}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        role={selectedRole}
        permissions={permissions}
        onSave={handleEditRole}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        entity={selectedRole}
        entityType="role"
      />
    </div>
  );
};

export default RolesSection;