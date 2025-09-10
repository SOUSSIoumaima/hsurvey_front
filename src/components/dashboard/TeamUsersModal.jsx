import React, { useState, useEffect } from "react";
import { Users, X, UserPlus, UserMinus, Search } from "lucide-react";
import Button from "../common/Button";
import { apiService } from '../../services/apiService';

const TeamUsersModal = ({ open, onClose, team }) => {
  const [teamUsers, setTeamUsers] = useState([]);
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open && team && team.department && team.department.id) {
      loadTeamUsers();
      loadDepartmentUsers();
    }
  }, [open, team]);

  const loadTeamUsers = async () => {
    try {
      const users = await apiService.getTeamUsers(team.id);
      setTeamUsers(users);
    } catch (err) {
      setError("Error loading team users");
    }
  };

  const loadDepartmentUsers = async () => {
    if (!team || !team.department || !team.department.id) return;
    try {
      const users = await apiService.getDepartmentUsers(team.department.id);
      setDepartmentUsers(users);
    } catch (err) {
      setError("Error loading department users");
    }
  };

  const handleAssignUser = async (userId) => {
    setLoading(true);
    setError("");
    try {
      await apiService.assignUserToTeam(team.id, userId);
      await loadTeamUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error assigning user to team");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    setLoading(true);
    setError("");
    try {
      await apiService.removeUserFromTeam(team.id, userId);
      await loadTeamUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error removing user from team");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !team) return null;

  // Filter users based on search term
  const filteredUsers = departmentUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate assigned and unassigned users
  const assignedUserIds = teamUsers.map(user => user.id);
  const unassignedUsers = filteredUsers.filter(user => !assignedUserIds.includes(user.id));
  const assignedUsers = teamUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl h-[90vh] flex flex-col relative transform transition-all duration-300 scale-100 animate-slide-up border border-gray-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Manage Team Users</h3>
            <p className="text-gray-600 mt-1">
              {team.name} - Assign or remove users
            </p>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mb-4 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-800 text-sm transition-all duration-200 hover:border-purple-300"
            />
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake flex items-center gap-2 mb-4 flex-shrink-0">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            {error}
          </div>
        )}
        {/* Content Area - Takes remaining space */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Available Users */}
            <div className="space-y-4 flex flex-col">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 flex-shrink-0">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Available Users ({unassignedUsers.length})
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto min-h-0">
                {unassignedUsers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No available users to assign</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unassignedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors duration-200">
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <Button
                          onClick={() => handleAssignUser(user.id)}
                          loading={loading}
                          label="Assign"
                          variant="primary"
                          className="px-3 py-1 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Assigned Users */}
            <div className="space-y-4 flex flex-col">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 flex-shrink-0">
                <UserMinus className="w-5 h-5 text-red-600" />
                Assigned Users ({assignedUsers.length})
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto min-h-0">
                {assignedUsers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No users assigned to this team</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-red-300 transition-colors duration-200">
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <Button
                          onClick={() => handleRemoveUser(user.id)}
                          loading={loading}
                          label="Remove"
                          variant="danger"
                          className="px-3 py-1 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6 flex-shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            label="Close"
            className="px-6 py-2"
          />
        </div>
      </div>
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

export default TeamUsersModal; 