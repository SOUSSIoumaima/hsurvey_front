import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { 
  ClipboardList, 
  Users, 
  Building, 
  BarChart3, 
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import NavBar from '../components/common/NavBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { surveyService } from '../services/surveyService';
import { organizationService } from '../services/organizationService';
import { questionService } from '../services/questionService';
import { optionService } from '../services/optionService';


const UserHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const navigate = useNavigate();

  const closeSurveyModal = () => {
    setSelectedSurvey(null);
    setShowQuizModal(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [surveysData, departmentsData, teamsData] = await Promise.all([
        surveyService.getAllSurveys(),
        organizationService.getDepartments(),
        organizationService.getTeams()
      ]);

      setSurveys(surveysData || []);
      setDepartments(departmentsData || []);
      setTeams(teamsData || []);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate user stats
  const userStats = {
    totalSurveys: surveys.length,
    activeSurveys: surveys.filter(s => !s.locked && s.status === 'ACTIVE').length,
    completedSurveys: surveys.filter(s => s.status === 'COMPLETED').length,
    userDepartment: departments.find(d => d.departmentId === user?.departmentId)?.name || 'Not Assigned',
    userTeam: teams.find(t => t.teamId === user?.teamId)?.name || 'Not Assigned'
  };

  // Get surveys for the user's department/team
  const userSurveys = surveys.filter(survey => {
  const matchDept = user?.departmentId && survey.departmentId 
    ? survey.departmentId === user.departmentId 
    : true;
  return matchDept && survey.status?.toUpperCase() !== 'DRAFT';
});

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'LOCKED': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'COMPLETED': return <Award className="w-4 h-4" />;
      case 'LOCKED': return <AlertCircle className="w-4 h-4" />;
      case 'DRAFT': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
            <button 
              onClick={loadUserData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <ClipboardList className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Welcome, {user?.username || 'User'}!</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Participate in surveys to help improve our organization. Your feedback matters!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{userStats.activeSurveys}</p>
                <p className="text-sm font-medium text-gray-600">Active Surveys</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Surveys you can participate in</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-500 p-3 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{userStats.completedSurveys}</p>
                <p className="text-sm font-medium text-gray-600">Completed</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Surveys you've finished</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 truncate">{userStats.userDepartment}</p>
                <p className="text-sm font-medium text-gray-600">Department</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Your department</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 truncate">{userStats.userTeam}</p>
                <p className="text-sm font-medium text-gray-600">Team</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Your team</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Surveys */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Available Surveys</h2>
                <div className="text-sm text-gray-500">
                  {userSurveys.length} survey{userSurveys.length !== 1 ? 's' : ''} available
                </div>
              </div>
              
              {userSurveys.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No surveys available at the moment.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for new surveys!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userSurveys.map((survey, index) => (
                    <div key={survey.surveyId || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{survey.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {survey.departmentName && (
                              <span className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{survey.departmentName}</span>
                              </span>
                            )}
                            {survey.teamName && (
                              <span className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{survey.teamName}</span>
                              </span>
                            )}
                            {survey.createdAt && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(survey.status)}`}>
                            {getStatusIcon(survey.status)}
                            <span>{survey.status}</span>
                            </span>
                        </div>
                      </div>
                      
                      {survey.status === 'ACTIVE' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                          onClick={() => navigate(`/survey/${survey.surveyId}`)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Take Survey</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Take Survey</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">View Results</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-800">Team Dashboard</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Survey Calendar</span>
                </button>
              </div>
            </div>

            {/* Survey Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Survey Insights</h2>
              </div>
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {userStats.totalSurveys > 0 ? Math.round((userStats.completedSurveys / userStats.totalSurveys) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Participation Rate</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{userStats.completedSurveys}</p>
                  <p className="text-sm text-gray-600">Surveys Completed</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{userStats.activeSurveys}</p>
                  <p className="text-sm text-gray-600">Active Surveys</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800">{user?.username || 'User'}</p>
                    <p className="text-sm text-gray-500">Username</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-800">{userStats.userDepartment}</p>
                    <p className="text-sm text-gray-500">Department</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-800">{userStats.userTeam}</p>
                    <p className="text-sm text-gray-500">Team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserHome; 