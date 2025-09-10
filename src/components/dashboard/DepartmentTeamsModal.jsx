import React, { useState, useEffect } from "react";
import { Target, Plus, Edit, Trash2, Users, X } from "lucide-react";
import Button from "../common/Button";
import { apiService } from '../../services/apiService';
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const DepartmentTeamsModal = ({ open, onClose, department, allUsers, onManageTeamUsers }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    if (open && department) {
      fetchTeams();
    }
  }, [open, department]);

  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.getTeamsByDepartment(department.id);
      setTeams(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error loading teams");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setTeamLoading(true);
    setError("");
    try {
      await apiService.createTeam({ name: teamName, departmentId: department.id });
      setTeamName("");
      setShowAdd(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error creating team");
    } finally {
      setTeamLoading(false);
    }
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    setTeamLoading(true);
    setError("");
    try {
      await apiService.updateTeam(editTeam.id, { name: teamName });
      setEditTeam(null);
      setTeamName("");
      setShowEdit(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error updating team");
    } finally {
      setTeamLoading(false);
    }
  };

  const openDeleteModal = (team) => {
    setSelectedTeam(team);
    setShowDeleteModal(true);
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    setDeleteLoading(true);
    setError("");
    try {
      await apiService.deleteTeam(selectedTeam.id);
      setShowDeleteModal(false);
      setSelectedTeam(null);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error deleting team");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!open || !department) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl h-[80vh] flex flex-col relative transform transition-all duration-300 scale-100 animate-slide-up border border-gray-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Teams in {department.name}</h3>
            <p className="text-gray-600 mt-1">Manage teams for this department</p>
          </div>
        </div>
        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake flex items-center gap-2 mb-4 flex-shrink-0">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            {error}
          </div>
        )}
        {/* Add/Edit Team Form */}
        {(showAdd || showEdit) && (
          <form onSubmit={showAdd ? handleAddTeam : handleEditTeam} className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Team name"
              required
              className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-800 font-medium transition-all duration-200 hover:border-purple-300"
            />
            <Button
              type="submit"
              variant="primary"
              loading={teamLoading}
              label={showAdd ? "Add" : "Update"}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setShowAdd(false); setShowEdit(false); setEditTeam(null); setTeamName(""); }}
              label="Cancel"
              className="px-6 py-2"
            />
          </form>
        )}
        {/* Teams List */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {teams.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No teams found for this department.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-900">{team.name}</div>
                      <div className="text-xs text-gray-500">Team ID: {team.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      label="Users"
                      onClick={() => onManageTeamUsers(team)}
                      className="px-3 py-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      label={<Edit className="w-4 h-4" />}
                      onClick={() => { setShowEdit(true); setEditTeam(team); setTeamName(team.name); }}
                      className="px-3 py-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      label={<Trash2 className="w-4 h-4" />}
                      onClick={() => openDeleteModal(team)}
                      className="px-3 py-1 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Add Team Button */}
        {!showAdd && !showEdit && (
          <div className="flex justify-end mt-6 flex-shrink-0">
            <Button
              type="button"
              variant="primary"
              label={<><Plus className="w-4 h-4" /> Add Team</>}
              onClick={() => { setShowAdd(true); setTeamName(""); }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            />
          </div>
        )}
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedTeam(null); }}
          onConfirm={handleDeleteTeam}
          loading={deleteLoading}
          entity={selectedTeam}
          entityType="team"
          title="Delete Team"
          description="This action cannot be undone"
          warningItems={[
            'Remove team and all its data',
            'Users in this team will be affected',
            'Cannot be recovered once deleted'
          ]}
          entityDisplay={(team) => ({
            avatar: team?.name?.charAt(0).toUpperCase(),
            name: team?.name,
            subtitle: team ? `Team ID: ${team.id}` : ''
          })}
        />
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

export default DepartmentTeamsModal; 