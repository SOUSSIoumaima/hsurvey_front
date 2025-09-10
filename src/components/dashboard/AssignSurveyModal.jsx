import React, { useState, useEffect } from 'react';
import { X, Building, Users, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { surveyService } from '../../services/surveyService';
import { apiService } from '../../services/apiService';
import { useSelector } from 'react-redux';

const AssignSurveyModal = ({ 
  open, 
  onClose, 
  survey, 
  onSuccess 
}) => {
  const { user: currentUser } = useSelector(state => state.auth);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [assignmentType, setAssignmentType] = useState('department'); // 'department' or 'team'

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadTeams();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await apiService.getTeams();
      setTeams(data);
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  };

  const handleAssign = async () => {
    if (!survey || !currentUser?.organizationId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (assignmentType === 'department' && selectedDepartment) {
        await surveyService.assignSurveyToDepartment(
          currentUser.organizationId,
          selectedDepartment,
          survey.surveyId
        );
        setSuccess(`Survey successfully assigned to department!`);
      } else if (assignmentType === 'team' && selectedTeam) {
        await surveyService.assignSurveyToTeam(
          currentUser.organizationId,
          selectedTeam,
          survey.surveyId
        );
        setSuccess(`Survey successfully assigned to team!`);
      } else {
        setError('Please select a department or team');
        return;
      }

      // Reset form
      setSelectedDepartment('');
      setSelectedTeam('');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error assigning survey');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!survey || !currentUser?.organizationId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (assignmentType === 'department' && selectedDepartment) {
        await surveyService.removeSurveyFromDepartment(
          currentUser.organizationId,
          selectedDepartment,
          survey.surveyId
        );
        setSuccess(`Survey successfully removed from department!`);
      } else if (assignmentType === 'team' && selectedTeam) {
        await surveyService.removeSurveyFromTeam(
          currentUser.organizationId,
          selectedTeam,
          survey.surveyId
        );
        setSuccess(`Survey successfully removed from team!`);
      } else {
        setError('Please select a department or team');
        return;
      }

      // Reset form
      setSelectedDepartment('');
      setSelectedTeam('');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error removing survey');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !survey) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Survey</h3>
                  <p className="text-sm text-gray-600">Assign survey to departments or teams</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Survey Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {survey.title?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{survey.title}</h4>
                  <p className="text-sm text-gray-600">{survey.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {survey.type}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      {survey.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assignment Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="department"
                    checked={assignmentType === 'department'}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <Building className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Department</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="team"
                    checked={assignmentType === 'team'}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <Users className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Team</span>
                </label>
              </div>
            </div>

            {/* Department Selection */}
            {assignmentType === 'department' && (
              <div className="mb-6">
                <label htmlFor="department-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Department
                </label>
                <div className="relative">
                  <select
                    id="department-select"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 font-medium transition-all duration-200 appearance-none cursor-pointer hover:border-blue-300"
                  >
                    <option value="">Choose a department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id || dept._id} value={dept.id || dept._id}>
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
            )}

            {/* Team Selection */}
            {assignmentType === 'team' && (
              <div className="mb-6">
                <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Team
                </label>
                <div className="relative">
                  <select
                    id="team-select"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 font-medium transition-all duration-200 appearance-none cursor-pointer hover:border-blue-300"
                  >
                    <option value="">Choose a team...</option>
                    {teams.map((team) => (
                      <option key={team.id || team._id} value={team.id || team._id}>
                        {team.name} {team.department && `(${team.department.name})`}
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
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={loading || (!selectedDepartment && !selectedTeam)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                {loading ? 'Assigning...' : 'Assign Survey'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignSurveyModal; 