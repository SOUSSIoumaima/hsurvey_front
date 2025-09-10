import React, { useState, useMemo } from "react";
import { UserPlus, Edit, X, Trash2, Search, Filter, ChevronLeft, ChevronRight, User } from "lucide-react";
import InputField from "../common/InputField";
import Button from "../common/Button";
import { useSelector } from 'react-redux';
import { apiService } from '../../services/apiService';
import AssignRoleModal from './AssignRoleModal';
import EditUserModal from './EditUserModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddUserModal from './AddUserModal';

const UsersSection = ({ users, onAddUser, reload, roles = [], departments = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Search, filter, and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter, sort, and paginate users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter ? (user.roles?.includes(roleFilter)) : true;
      const matchesDepartment = departmentFilter ? (user.department === departmentFilter) : true;
      return matchesSearch && matchesRole && matchesDepartment;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "username":
          aValue = a.username?.toLowerCase() || '';
          bValue = b.username?.toLowerCase() || '';
          break;
        case "email":
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case "role":
          aValue = (a.roles?.[0] || 'User').toLowerCase();
          bValue = (b.roles?.[0] || 'User').toLowerCase();
          break;
        case "department":
          aValue = (a.department || '').toLowerCase();
          bValue = (b.department || '').toLowerCase();
          break;
        default:
          aValue = a.username?.toLowerCase() || '';
          bValue = b.username?.toLowerCase() || '';
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, sortBy, sortOrder, roleFilter, departmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);


  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="start-ellipsis" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            currentPage === i
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="end-ellipsis" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeletingUserId(selectedUser.id);
    try {
      await apiService.deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      reload && reload();
    } catch (err) {
      alert('Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-red-100 text-red-800 border-red-200',
      'Manager': 'bg-orange-100 text-orange-800 border-orange-200',
      'User': 'bg-blue-100 text-blue-800 border-blue-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role] || colors.default;
  };

  return (
    <div className="space-y-4">
      <AddUserModal open={showModal && !selectedUser} onClose={() => setShowModal(false)} onSuccess={reload} />
      <AssignRoleModal open={showModal && !!selectedUser} user={selectedUser} onClose={handleCloseModal} onSuccess={reload} />
      <EditUserModal open={showEditModal} user={selectedUser} onClose={() => { setShowEditModal(false); setSelectedUser(null); }} onSuccess={reload} />
      <DeleteConfirmationModal 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDeleteUser} 
        loading={deletingUserId !== null} 
        entity={selectedUser}
        entityType="user"
      />
      
      {/* Compact Header with integrated controls */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              <p className="text-sm text-gray-500">Manage your team members and their access levels</p>
            </div>
          </div>
          
          {/* Create Button */}
          <button 
            onClick={() => { setShowModal(true); setSelectedUser(null); }} 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
        
        {/* Search and Filter Row */}
        <div className="flex flex-col lg:flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800 text-sm transition-all duration-200 hover:border-green-300"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-green-300"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.id || role} value={role.name || role}>
                    {role.name || role}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-green-300"
              >
                <option value="">All Departments</option>
                {departments.map(dep => (
                  <option key={dep.id || dep} value={dep.name || dep}>
                    {dep.name || dep}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-green-300"
              >
                <option value="username">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="role">Sort by Role</option>
                <option value="department">Sort by Department</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 text-sm"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
          
          {/* Results Summary */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length}
            </span>
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              {users.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center gap-2">
                    User
                    {sortBy === "username" && (
                      <span className="text-green-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortBy === "email" && (
                      <span className="text-green-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-2">
                    Role
                    {sortBy === "role" && (
                      <span className="text-green-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("department")}
                >
                  <div className="flex items-center gap-2">
                    Department
                    {sortBy === "department" && (
                      <span className="text-green-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || roleFilter || departmentFilter ? "Try adjusting your search criteria" : "Get started by adding your first user"}
                      </p>
                      {!searchTerm && !roleFilter && !departmentFilter && (
                        <button 
                          onClick={() => { setShowModal(true); setSelectedUser(null); }}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <UserPlus className="w-5 h-5" />
                          Add First User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => handleRowClick(user)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                          <span className="text-white text-sm font-semibold">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || ['User']).map(role => (
                          <span 
                            key={role} 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(role)}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full border border-gray-200">
                          {user.department || 'Not assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 border border-green-200 hover:border-green-300" 
                          onClick={(e) => { e.stopPropagation(); handleEditUser(user); }}
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300 disabled:opacity-50" 
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowDeleteModal(true); }} 
                          disabled={deletingUserId === user.id}
                          title="Delete User"
                        >
                          {deletingUserId === user.id ? (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSection;