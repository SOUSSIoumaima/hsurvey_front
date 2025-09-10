import React, { useEffect, useState, useMemo } from "react";
import { Eye, Search, ClipboardList, Target, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { surveyService } from '../../services/surveyService';
import { useSelector } from 'react-redux';
import SurveyBankDetails from "../survey/SurveyBankDetails";
import ViewPublishedSurveyModal from "./ViewPublishedSurveyModal";
import AssignSurveyModal from "./AssignSurveyModal";

const SurveyBankSection = ({ getSurveyTypeColor, getStatusColor, formatDate }) => {
  const { token } = useSelector(state => state.auth);

  const [surveysLocal, setSurveysLocal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // Search, filter, and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await surveyService.getActiveAndClosedSurveys();
        setSurveysLocal(data);
      } catch (err) {
        setError("Erreur");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [token]);

  // Get unique types and statuses for filters
  const uniqueTypes = useMemo(() => {
    return [...new Set(surveysLocal.map(survey => survey.type).filter(Boolean))];
  }, [surveysLocal]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(surveysLocal.map(survey => survey.status).filter(Boolean))];
  }, [surveysLocal]);

  // Filter, sort, and paginate surveys
  const filteredAndSortedSurveys = useMemo(() => {
    let filtered = surveysLocal.filter(survey => {
      const matchesSearch =
        survey.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter ? survey.type === typeFilter : true;
      const matchesStatus = statusFilter ? survey.status === statusFilter : true;
      return matchesSearch && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case "type":
          aValue = a.type?.toLowerCase() || '';
          bValue = b.type?.toLowerCase() || '';
          break;
        case "status":
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case "deadline":
          aValue = a.deadline || '';
          bValue = b.deadline || '';
          break;
        default:
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [surveysLocal, searchTerm, sortBy, sortOrder, typeFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSurveys = filteredAndSortedSurveys.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

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
              ? "bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-lg"
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

  const handleViewSurvey = async (surveyId) => {
    setLoading(true);
    try {
      const data = await surveyService.getSurveyById(surveyId);
      console.log("Survey detail data:", data);
      setSelectedSurvey(data);
      setShowViewModal(true);
    } catch (error) {
      setError("Erreur lors du chargement du sondage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header with integrated controls */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-r from-sky-400 to-sky-500 rounded-lg flex items-center justify-center shadow-md">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Survey Bank Management</h2>
              <p className="text-sm text-gray-500">Manage your list of surveys in the bank</p>
            </div>
          </div>
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
                placeholder="Search surveys by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-gray-800 text-sm transition-all duration-200 hover:border-sky-300"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 hover:border-sky-300"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 hover:border-sky-300"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
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
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 hover:border-sky-300"
              >
                <option value="title">Sort by Title</option>
                <option value="type">Sort by Type</option>
                <option value="status">Sort by Status</option>
                <option value="deadline">Sort by Deadline</option>
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
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedSurveys.length)} of {filteredAndSortedSurveys.length}
            </span>
            <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-full text-xs font-medium">
              {surveysLocal.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading && (
          <div className="px-6 py-8 text-center">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 animate-spin border-2 border-sky-400 border-t-transparent rounded-full mr-3"></div>
              <span className="text-gray-600">Loading surveys...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <div className="text-red-700">{error}</div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Title
                    {sortBy === "title" && (
                      <span className="text-sky-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {sortBy === "type" && (
                      <span className="text-sky-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortBy === "status" && (
                      <span className="text-sky-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("deadline")}
                >
                  <div className="flex items-center gap-2">
                    Deadline
                    {sortBy === "deadline" && (
                      <span className="text-sky-600">
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
              {currentSurveys.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || typeFilter || statusFilter ? "Try adjusting your search criteria" : "No surveys available in the bank"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentSurveys.map((survey) => (
                  <tr key={survey.surveyId} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                          <span className="text-white text-sm font-semibold">
                            {survey.title?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{survey.title}</div>
                          <div className="text-sm text-gray-500">{survey.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSurveyTypeColor(survey.type)}`}>
                        {survey.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(survey.status)}`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {survey.deadline ? formatDate(survey.deadline) : 'No deadline'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors duration-200 border border-sky-200 hover:border-sky-300" 
                          onClick={() => handleViewSurvey(survey.surveyId)}
                          title="View Survey"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 border border-indigo-200 hover:border-indigo-300"
                          onClick={() => {
                            setSelectedSurvey(survey);
                            setShowAssignModal(true);
                          }}
                          title="Assign Survey"
                        >
                          <Target className="w-4 h-4" />
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

      <ViewPublishedSurveyModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSurvey(null);
        }}
        survey={selectedSurvey}
      />

      <AssignSurveyModal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedSurvey(null);
        }}
        survey={selectedSurvey}
        onSuccess={() => {
          // Optionally reload surveys after assignment
          const fetchSurveys = async () => {
            try {
              const data = await surveyService.getActiveAndClosedSurveys();
              setSurveysLocal(data);
            } catch (err) {
              setError("Erreur");
            }
          };
          fetchSurveys();
        }}
      />
    </div>
  );
};

export default SurveyBankSection;