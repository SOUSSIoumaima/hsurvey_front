"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import NavBar from '../components/common/NavBar';
import { apiService } from '../services/apiService';
import QuestionsSection from '../components/dashboard/QuestionSection';
import { isDepartmentManager, isTeamManager } from '../utils/roleUtils';

import {Users,Building2,FileText,Shield,Plus,Edit,Trash2,Search,Filter,Settings,BarChart3,UserCheck,Globe,MapPin,Home,  Bell,  LogOut,  ChevronDown,  Eye,  UserPlus,  ShieldCheck,  Users2,  Loader2,  AlertCircle,  X,  ClipboardList,  Target,  TrendingUp,  Calendar,  Award,  Lock,  Unlock,  CheckCircle,  Clock,  AlertTriangle} from "lucide-react";
import OverviewSection from '../components/dashboard/OverviewSection';
import { useOverviewData } from '../hooks/useOverviewData';
import SurveysSection from '../components/dashboard/SurveysSection';
import UsersSection from '../components/dashboard/UsersSection';
import OrganizationsSection from '../components/dashboard/OrganizationsSection';
import DepartmentsSection from '../components/dashboard/DepartmentsSection';
import TeamsSection from '../components/dashboard/TeamsSection';
import DepartmentTeamsModal from '../components/dashboard/DepartmentTeamsModal';
import TeamUsersModal from '../components/dashboard/TeamUsersModal';
import RolesSection from '../components/dashboard/RolesSection';
import AddDepartmentModal from '../components/dashboard/AddDepartmentModal';
import EditDepartmentModal from '../components/dashboard/EditDepartmentModal';
import DeleteConfirmationModal from '../components/dashboard/DeleteConfirmationModal';
import DepartmentUsersModal from '../components/dashboard/DepartmentUsersModal';
import SurveyBankSection from "../components/dashboard/SurveyBankSection";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user: currentUser } = useSelector(state => state.auth);
  
  const {
    loading,
    error,
    organizations,
    departments,
    teams,
    users,
    surveys,
    roles,
    permissions,
    questions,
    surveyResponses,
    reload
  } = useOverviewData(currentUser);

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDepartmentUsersModal, setShowDepartmentUsersModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentTeamsModal, setShowDepartmentTeamsModal] = useState(false);
  const [selectedDepartmentForTeams, setSelectedDepartmentForTeams] = useState(null);
  const [showTeamUsersModal, setShowTeamUsersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Ensure activeTab is valid for the current user's role
  React.useEffect(() => {
    if (currentUser) {
      const validTabs = getFilteredTabs().map(tab => tab.id);
      if (!validTabs.includes(activeTab)) {
        setActiveTab(validTabs[0] || 'overview');
      }
    }
  }, [currentUser, activeTab]);

  const getDashboardStats = () => {
    if (isDepartmentManager(currentUser)) {
      // DEPARTMENT MANAGER stats
      return [
        {
          title: 'Organization',
          value: organizations[0]?.name || 'Loading...',
          icon: Building2,
          color: 'bg-blue-500',
          description: 'Your organization'
        },
        {
          title: 'Departments',
          value: departments.length,
          icon: Users,
          color: 'bg-green-500',
          description: 'In your organization'
        },
        {
          title: 'Teams',
          value: teams.length,
          icon: Users2,
          color: 'bg-purple-500',
          description: 'Active teams'
        },
        {
          title: 'Active Surveys',
          value: surveys.filter(s => s.status === 'ACTIVE').length,
          icon: ClipboardList,
          color: 'bg-indigo-500',
          description: 'Currently running'
        },
        {
          title: 'Survey Responses',
          value: surveyResponses.length,
          icon: BarChart3,
          color: 'bg-pink-500',
          description: 'Total submissions'
        }
      ];
    } else if (isTeamManager(currentUser)) {
      // TEAM MANAGER stats
      return [
        {
          title: 'Organization',
          value: organizations[0]?.name || 'Loading...',
          icon: Building2,
          color: 'bg-blue-500',
          description: 'Your organization'
        },
        {
          title: 'Teams',
          value: teams.length,
          icon: Users2,
          color: 'bg-purple-500',
          description: 'Active teams'
        },
        {
          title: 'Active Surveys',
          value: surveys.filter(s => s.status === 'ACTIVE').length,
          icon: ClipboardList,
          color: 'bg-indigo-500',
          description: 'Currently running'
        },
        {
          title: 'Survey Responses',
          value: surveyResponses.length,
          icon: BarChart3,
          color: 'bg-pink-500',
          description: 'Total submissions'
        }
      ];
    } else {
      // ORGANIZATION MANAGER stats (full access)
      return [
        {
          title: 'Organization',
          value: organizations[0]?.name || 'Loading...',
          icon: Building2,
          color: 'bg-blue-500',
          description: 'Your organization'
        },
        {
          title: 'Departments',
          value: departments.length,
          icon: Users,
          color: 'bg-green-500',
          description: 'In your organization'
        },
        {
          title: 'Teams',
          value: teams.length,
          icon: Users2,
          color: 'bg-purple-500',
          description: 'Active teams'
        },
        {
          title: 'Total Users',
          value: users.length,
          icon: UserCheck,
          color: 'bg-orange-500',
          description: 'In your organization'
        },
        {
          title: 'Active Surveys',
          value: surveys.filter(s => s.status === 'ACTIVE').length,
          icon: ClipboardList,
          color: 'bg-indigo-500',
          description: 'Currently running'
        },
        {
          title: 'Survey Responses',
          value: surveyResponses.length,
          icon: BarChart3,
          color: 'bg-pink-500',
          description: 'Total submissions'
        }
      ];
    }
  };

  const dashboardStats = getDashboardStats();

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'LOCKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSurveyTypeColor = (type) => {
    switch (type) {
      case 'FEEDBACK': return 'bg-blue-100 text-blue-800';
      case 'EXAM': return 'bg-purple-100 text-purple-800';
      case 'ASSESSMENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const onCreateSurvey = () => {
    alert('Create Survey clicked!');
  };

  const onAddUser = () => {
    alert('Add User clicked!');
  };

  const onCreateDepartment = () => {
    setShowAddDepartmentModal(true);
  };

  const onEditDepartment = (department) => {
    setSelectedDepartment(department);
    setShowEditDepartmentModal(true);
  };

  const onDeleteDepartment = (department) => {
    setSelectedDepartment(department);
    setShowDeleteDepartmentModal(true);
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    
    setDeleteLoading(true);
    try {
      await apiService.deleteDepartment(selectedDepartment.id);
      setShowDeleteDepartmentModal(false);
      setSelectedDepartment(null);
      reload && reload();
    } catch (error) {
      console.error('Error deleting department:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const onManageUsers = (department) => {
    setSelectedDepartment(department);
    setShowDepartmentUsersModal(true);
  };

  const onDepartmentTeams = (department) => {
    setSelectedDepartmentForTeams(department);
    setShowDepartmentTeamsModal(true);
  };

  const onManageTeamUsers = (team) => {
    setSelectedTeam(team);
    setShowTeamUsersModal(true);
  };

  const onCreateTeam = () => {
    alert('Create Team clicked!');
  };

  const onCreateRole = async (roleData) => {
    try {
      const createdRole = await apiService.createRole({
        name: roleData.name,
        description: roleData.description
      });

      for (const permissionId of roleData.permissions) {
        await apiService.addPermissionToRole(createdRole.id, permissionId);
      }

      reload && reload(); 
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const onEditRole = async (roleData) => {
    try {
      // 1. Update role name and description
      await apiService.updateRole(roleData.id, {
        name: roleData.name,
        description: roleData.description
      });

      // 2. Find the old role object
      const oldRole = roles.find(r => r.id === roleData.id);
      const oldPermissions = (oldRole?.permissions || []).map(p => typeof p === "object" ? p.id : p);
      const newPermissions = roleData.permissions || [];

      // 3. Calculate permissions to add and remove
      const toAdd = newPermissions.filter(pid => !oldPermissions.includes(pid));
      const toRemove = oldPermissions.filter(pid => !newPermissions.includes(pid));

      // 4. Assign new permissions
      for (const permissionId of toAdd) {
        await apiService.addPermissionToRole(roleData.id, permissionId);
      }
      // 5. Remove unselected permissions
      for (const permissionId of toRemove) {
        await apiService.removePermissionFromRole(roleData.id, permissionId);
      }

      reload && reload();
    } catch (error) {
      console.error('Error editing role:', error);
    }
  };

  const onDeleteRole = async (roleId) => {
    try {
      await apiService.deleteRole(roleId);
      reload && reload(); 
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Define all possible tabs
  const allTabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'surveys', name: 'Surveys', icon: ClipboardList },
    { id: 'questions', name: 'Questions', icon: ClipboardList },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'organizations', name: 'Organization', icon: Building2 },
    { id: 'departments', name: 'Departments', icon: Users2 },
    { id: 'teams', name: 'Teams', icon: Target },
    { id: 'roles', name: 'Roles & Permissions', icon: Shield },
    { id: 'surveyBank', name: 'Survey Bank', icon: FileText } 
  ];

  // Filter tabs based on user role
  const getFilteredTabs = () => {
    if (!currentUser) return allTabs;
    
    if (isDepartmentManager(currentUser)) {
      // DEPARTMENT MANAGER: Surveys, Questions, Departments, Teams, Survey Bank
      return allTabs.filter(tab => 
        ['surveys', 'questions', 'departments', 'teams', 'surveyBank'].includes(tab.id)
      );
    } else if (isTeamManager(currentUser)) {
      // TEAM MANAGER: Surveys, Questions, Teams, Survey Bank
      return allTabs.filter(tab => 
        ['surveys', 'questions', 'teams', 'surveyBank'].includes(tab.id)
      );
    } else {
      // ORGANIZATION MANAGER or other roles: show all tabs
      return allTabs;
    }
  };

  const tabs = getFilteredTabs();

  // Early return for loading user
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }



  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewSection
            stats={dashboardStats}
            organizations={organizations}
            surveys={surveys}
            users={users}
            getStatusColor={getStatusColor}
            getSurveyTypeColor={getSurveyTypeColor}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
          />
        );
      case "surveys":
        return (
          <SurveysSection
            surveys={surveys}
            getSurveyTypeColor={getSurveyTypeColor}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            onCreateSurvey={onCreateSurvey}
            reload={reload}
          />
        );
      
      case "surveyBank":
        return (
        <SurveyBankSection
        getSurveyTypeColor={getSurveyTypeColor}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
        reload={reload}
        />
      );
      case "questions":
        return (
          <QuestionsSection
            questions={questions}
            reload={reload} 
          />
        );
      case "users":
        // Only show users section for ORGANIZATION MANAGER
        if (!isDepartmentManager(currentUser) && !isTeamManager(currentUser)) {
          return (
            <UsersSection 
              users={users} 
              roles={roles}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              reload={reload} 
            />
          );
        }
        return <div className="p-6 text-center text-gray-500">Access denied</div>;
      case "organizations":
        // Only show organizations section for ORGANIZATION MANAGER
        if (!isDepartmentManager(currentUser) && !isTeamManager(currentUser)) {
          return (
            <OrganizationsSection 
              organizations={organizations} 
              departments={departments} 
              teams={teams} 
              users={users}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              reload={reload}
            />
          );
        }
        return <div className="p-6 text-center text-gray-500">Access denied</div>;
      case "departments":
        // Only show departments section for ORGANIZATION MANAGER and DEPARTMENT MANAGER
        if (!isTeamManager(currentUser)) {
          return (
            <DepartmentsSection
              departments={departments}
              users={users}
              onCreateDepartment={onCreateDepartment}
              onEditDepartment={onEditDepartment}
              onDeleteDepartment={onDeleteDepartment}
              onManageUsers={onManageUsers}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          );
        }
        return <div className="p-6 text-center text-gray-500">Access denied</div>;
      case "teams":
        return (
          <TeamsSection
            departments={departments}
            onDepartmentClick={onDepartmentTeams}
          />
        );
      case "roles":
        // Only show roles section for ORGANIZATION MANAGER
        if (!isDepartmentManager(currentUser) && !isTeamManager(currentUser)) {
          return (
            <RolesSection
              roles={roles}
              permissions={permissions}
              onCreateRole={onCreateRole}
              onEditRole={onEditRole}
              onDeleteRole={onDeleteRole}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          );
        }
        return <div className="p-6 text-center text-gray-500">Access denied</div>;
      default:
        return (
          <OverviewSection 
            stats={dashboardStats}
            organizations={organizations}
            surveys={surveys}
            users={users}
            getStatusColor={getStatusColor}
            getSurveyTypeColor={getSurveyTypeColor}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {currentUser?.username}! 
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {renderContent()}
        </div>
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        open={showAddDepartmentModal}
        onClose={() => setShowAddDepartmentModal(false)}
        onSuccess={() => {
          setShowAddDepartmentModal(false);
          reload && reload();
        }}
      />

      {/* Edit Department Modal */}
      <EditDepartmentModal
        open={showEditDepartmentModal}
        onClose={() => setShowEditDepartmentModal(false)}
        onSuccess={() => {
          setShowEditDepartmentModal(false);
          setSelectedDepartment(null);
          reload && reload();
        }}
        department={selectedDepartment}
      />

      {/* Delete Department Modal */}
      <DeleteConfirmationModal
        open={showDeleteDepartmentModal}
        onClose={() => setShowDeleteDepartmentModal(false)}
        onConfirm={handleDeleteDepartment}
        loading={deleteLoading}
        entity={selectedDepartment}
        entityType="department"
        title="Delete Department"
        description="This action cannot be undone"
        warningItems={[
          'Remove department and all its data',
          'Users in this department will be affected',
          'Cannot be recovered once deleted'
        ]}
        entityDisplay={(dept) => ({
          avatar: dept.name?.charAt(0).toUpperCase(),
          name: dept.name,
          subtitle: `Department ID: ${dept.id}`
        })}
      />

      {/* Department Users Modal */}
      <DepartmentUsersModal
        open={showDepartmentUsersModal}
        onClose={() => setShowDepartmentUsersModal(false)}
        onSuccess={() => {
          // Don't close modal or reload - let user continue managing users
        }}
        department={selectedDepartment}
        allUsers={users}
      />
      {/* Department Teams Modal */}
      <DepartmentTeamsModal
        open={showDepartmentTeamsModal}
        onClose={() => { setShowDepartmentTeamsModal(false); setSelectedDepartmentForTeams(null); }}
        department={selectedDepartmentForTeams}
        allUsers={users}
        onManageTeamUsers={onManageTeamUsers}
      />
      {/* Team Users Modal */}
      <TeamUsersModal
        open={showTeamUsersModal}
        onClose={() => { setShowTeamUsersModal(false); setSelectedTeam(null); }}
        team={selectedTeam}
        allUsers={users}
      />
    </div>
  );
};

export default Dashboard;