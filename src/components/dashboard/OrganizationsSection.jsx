
import React, { useState } from "react";
import { Building2, Edit, Users, GitBranch, Building, BarChart3, Settings } from "lucide-react";
import EditOrganizationModal from './EditOrganizationModal';
import InvitationCodeCard from "./InvitationCodeCard"; 

const OrganizationsSection = ({
  organizations = [],
  departments = [],
  teams = [],
  users = [],
  reload
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const handleEditOrganization = (org) => {
    setSelectedOrganization(org);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrganization(null);
  };

  const org = organizations[0];
  if (!org) {
    return <div className="p-6 text-center text-gray-500">Loading organization data...</div>;
  }
  
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <EditOrganizationModal 
        open={showEditModal} 
        organization={selectedOrganization} 
        onClose={handleCloseEditModal} 
        onSuccess={reload} 
      />
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              
  <div>
  <h1 className="text-2xl font-bold text-gray-800">{org?.name}</h1>
  <InvitationCodeCard orgId={org?.id} /> {/* ✅ replaced the org ID line */}
</div>

            </div>
            <button 
              onClick={() => handleEditOrganization(org)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Organization
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Statistics */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{departments.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Departments</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{teams.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Teams</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{users.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Users</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Organization Overview</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Total Departments</span>
                    <span className="text-xl font-bold text-gray-800">{departments.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Active Teams</span>
                    <span className="text-xl font-bold text-gray-800">{teams.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Total Members</span>
                    <span className="text-xl font-bold text-gray-800">{users.length}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Avg Team Size</span>
                    <span className="text-xl font-bold text-gray-800">
                      {teams.length > 0 ? Math.round(users.length / teams.length) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Departments per Team</span>
                    <span className="text-xl font-bold text-gray-800">
                      {departments.length > 0 ? Math.round(teams.length / departments.length) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleEditOrganization(org)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Organization
                </button>
                
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Manage Users
                </button>
                
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Manage Teams
                </button>
                
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  Manage Departments
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Organization Stats</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className="text-green-600 font-semibold">+12%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Active Rate</span>
                  <span className="text-blue-600 font-semibold">85%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Efficiency</span>
                  <span className="text-purple-600 font-semibold">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default OrganizationsSection;
