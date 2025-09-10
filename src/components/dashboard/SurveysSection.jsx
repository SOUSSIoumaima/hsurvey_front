import React, { useState, useEffect, useMemo } from "react";
import { Plus, Eye, Edit, Lock, Unlock, Trash2, Upload, Search, ClipboardList } from "lucide-react";
import Button from "../common/Button";
import { surveyService } from '../../services/surveyService';
import { questionService } from '../../services/questionService';
import { useSelector } from 'react-redux';
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EditSurveyModal from "./EditSurveyModal";
import CreateSurveyModal from "./CreateSurveyModal";
import LockConfirmationModal from "./LockConfirmationModal";
import ViewSurveyModal from "./ViewSurveyModal";
import ErrorInfoModal from "./ErrorInfoModal";
import { apiService } from "../../services/apiService";

const SURVEY_STATUSES = ["DRAFT", "ACTIVE", "CLOSED"];
const SURVEY_TYPES = ["FEEDBACK", "EXAM"];

const SurveysSection = ({ getSurveyTypeColor, getStatusColor, formatDate, reload }) => {
  const { token } = useSelector(state => state.auth);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: SURVEY_TYPES[0],
    status: SURVEY_STATUSES[0],
    deadline: "",
    locked: false,
  });
  const [surveysLocal, setSurveysLocal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const [showQuestionsList, setShowQuestionsList] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [editingSurvey, setEditingSurvey] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [surveyToToggleLock, setSurveyToToggleLock] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Sorting states
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

   const [showErrorModal, setShowErrorModal] = useState(false);
   const [publishErrorMessage, setPublishErrorMessage] = useState("");




  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await surveyService.getAllSurveys();
        setSurveysLocal(data);
      } catch (err) {
        console.error("📛 Erreur API:", err.response?.data || err.message);
        setError("Error loading surveys.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [token]);

   
  const filteredAndSortedSurveys = useMemo(() => {
    let filtered = surveysLocal.filter(survey =>
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      survey.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the surveys
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
  }, [searchTerm, surveysLocal, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleToggleLockSurvey = async (surveyId, isCurrentlyLocked) => {
    try {
      if (isCurrentlyLocked) {
        await surveyService.unlockSurvey(surveyId);
      } else {
        await surveyService.lockSurvey(surveyId);
      }

      setSurveysLocal((prev) =>
        prev.map((s) =>
          s.surveyId === surveyId ? { ...s, locked: !isCurrentlyLocked } : s
        )
      );

      if (selectedSurvey?.surveyId === surveyId) {
        setSelectedSurvey((prev) => ({
          ...prev,
          locked: !isCurrentlyLocked,
        }));
      }
    } catch (error) {
      console.error("Error toggling survey lock:", error);
      setError("Error toggling lock state.");
    }
  };

  const handleViewSurvey = async (surveyId) => {
    setLoading(true);
    try {
      const surveyData = await surveyService.getSurveyById(surveyId);
      setSelectedSurvey(surveyData);
      setShowViewModal(true);
    } catch (error) {
      console.error("Survey loading error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateSurvey = async (e) => {
     e.preventDefault();
  setLoading(true);
  setError("");
  setPublishErrorMessage("");
  setShowErrorModal(false);

  try {
    const updatedSurvey = await surveyService.updateSurvey(editingSurvey.surveyId, form);
    setSurveysLocal((prev) =>
      prev.map((s) => (s.surveyId === updatedSurvey.surveyId ? updatedSurvey : s))
    );
    setEditingSurvey(null);
    setShowCreateForm(false);
    setSelectedSurvey(updatedSurvey);
  } catch (err) {
    console.error("Error updating survey:", err);
    const backendMessage = err?.response?.data?.message || "Error updating the survey.";
    setPublishErrorMessage(backendMessage);
    setShowErrorModal(true);
  } finally {
    setLoading(false);
  }
};

  const handleAddQuestionsClick = async () => {
  setLoading(true);
  try {
    const data = await questionService.getAllQuestions();
    setQuestions(data);
    setSelectedQuestions(new Set());
    setShowQuestionsList(true);

    
    if (selectedSurvey && selectedSurvey.locked) {
      const updatedSurvey = await surveyService.getSurveyById(selectedSurvey.surveyId);
      
      if (!updatedSurvey.locked) {
        setSelectedSurvey(updatedSurvey);
        setSurveysLocal(prev =>
          prev.map(s =>
            s.surveyId === updatedSurvey.surveyId ? updatedSurvey : s
          )
        );
      }
    }

  } catch (err) {
    console.error("Questions loading error:", err);
    setError("Error loading questions.");
  } finally {
    setLoading(false);
  }
};

  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return;
    setDeleting(true);
    try {
      await surveyService.deleteSurvey(surveyToDelete.surveyId);
      setSurveysLocal((prev) => prev.filter(s => s.surveyId !== surveyToDelete.surveyId));
      if (selectedSurvey && selectedSurvey.surveyId === surveyToDelete.surveyId) {
        setSelectedSurvey(null);
      }
      setShowDeleteModal(false);
      setSurveyToDelete(null);
    } catch (err) {
      console.error("Error deleting survey:", err);

      
      const backendMessage = err?.response?.data?.message;

      if (backendMessage) {
        setPublishErrorMessage(backendMessage);
        setShowErrorModal(true);   
      } else {
        setError("Error deleting the survey.");
      }
    } finally {
      setDeleting(false);
    }
  };
const handleAddQuestionToSurvey = async (questionId) => {
  if (!selectedSurvey) return;
  setLoading(true);
  try {
    await surveyService.assignQuestionToSurvey(selectedSurvey.surveyId, questionId);

    // Récupérer l'état réel du survey depuis le backend
    const updatedSurvey = await surveyService.getSurveyById(selectedSurvey.surveyId);

    // Mettre à jour le survey sélectionné
    setSelectedSurvey(updatedSurvey);

    // Mettre à jour la liste globale
    setSurveysLocal(prev =>
      prev.map(s =>
        s.surveyId === updatedSurvey.surveyId ? updatedSurvey : s
      )
    );

  } catch (err) {
    console.error("Error assigning question:", err);
    setError("Error adding question to the survey.");
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSurvey) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const createdSurvey = await surveyService.createSurvey(form);
      setSurveysLocal(prev => [...prev, createdSurvey]);
      setForm({
        title: "",
        description: "",
        type: SURVEY_TYPES[0],
        status: SURVEY_STATUSES[0],
        deadline: "",
        locked: false,
      });
      setShowCreateForm(false);

      setSelectedQuestions(new Set());
      const questionsData = await questionService.getAllQuestions();
      setQuestions(questionsData);
    } catch {
      setError("Error creating the survey.");
    } finally {
      setLoading(false);
    }
  };

  const reloadAndFetchQuestions = async () => {
    try {
      const allQuestions = await questionService.getAllQuestions(); 
      setQuestions(allQuestions);
    } catch (error) {
      console.error("Error reloading questions.", error);
    }
  };
const handlePublishSurvey = async (surveyId) => {
  console.log("=== Publishing survey debug ===");
  console.log("Survey ID:", surveyId);
  
  setLoading(true);
  setError("");
  setPublishErrorMessage("");
  setShowErrorModal(false);

  try {
    const publishedSurvey = await surveyService.publishSurvey(surveyId);
    console.log("Response from publishSurvey:", publishedSurvey);

    
    setSurveysLocal(prev =>
      prev.map(s => (s.surveyId === publishedSurvey.surveyId ? publishedSurvey : s))
    );

    
    if (selectedSurvey?.surveyId === publishedSurvey.surveyId) {
      setSelectedSurvey(publishedSurvey);
    }

  } catch (err) {
    console.error("Error publishing survey:", err);

    
    const backendMessage = err?.response?.data?.message;

    if (backendMessage) {
      setPublishErrorMessage(backendMessage);  
      setShowErrorModal(true);
    } else {
      
      setError("Error publishing the survey.");
    }

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
              <h2 className="text-xl font-bold text-gray-800">Survey Management</h2>
              <p className="text-sm text-gray-500">Manage your surveys and collect feedback</p>
            </div>
          </div>
          
          {/* Create Button */}
          <button 
            onClick={() => setShowCreateForm(prev => !prev)}
            className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-sm"
          >
            <Plus className="w-4 h-4" />
            {showCreateForm ? "Cancel" : "Create Survey"}
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
                placeholder="Search surveys by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-gray-800 text-sm transition-all duration-200 hover:border-sky-300"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
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
              {filteredAndSortedSurveys.length} result{filteredAndSortedSurveys.length !== 1 && "s"}
            </span>
            <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded-full text-xs font-medium">
              {surveysLocal.length} Total
            </span>
          </div>
        </div>
      </div>

      <CreateSurveyModal
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        form={form}
        setForm={setForm}
        onSubmit={editingSurvey ? handleUpdateSurvey : handleSubmit}
        loading={loading}
        error={error}
      />

      {/* Surveys Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Survey
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
              {filteredAndSortedSurveys.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm ? "Try adjusting your search criteria" : "Get started by creating your first survey"}
                      </p>
                      {!searchTerm && (
                        <button 
                          onClick={() => setShowCreateForm(true)}
                          className="bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <Plus className="w-5 h-5" />
                          Create First Survey
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedSurveys.map((survey) => (       
                  <React.Fragment key={survey.surveyId}>
                    <tr className="hover:bg-gray-50 transition-colors duration-200">
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
                           className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 border border-green-200 hover:border-green-300"
                           onClick={() => {
                            if (survey.locked) {
                              setPublishErrorMessage("Question is locked and cannot be updated");
                              setShowErrorModal(true);
                            } else {
                              setSelectedSurvey(survey);
                              setShowEditModal(true);
                            }
                          }}
                          title={survey.locked ? "Survey is locked" : "Edit Survey"}>
                            <Edit className="w-4 h-4" />
                            </button>

                          {/* Lock / Unlock Survey */}
                          <button
                          className="p-2 rounded-lg transition-colors duration-200 border text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={() => {
                            setSurveyToToggleLock(survey);
                            setShowLockModal(true);
                          }}
                          title={survey.locked ? "Survey is locked. Click to unlock." : "Survey is unlocked. Click to lock."}
                          >
                            {survey.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          
                          <button
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 border border-purple-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handlePublishSurvey(survey.surveyId)}
                            title="Publish Survey"
                            disabled={survey.status !== "DRAFT"}
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
                            onClick={() => {
                              setSurveyToDelete(survey);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Survey"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSurveyToDelete(null);
        }}
        onConfirm={handleDeleteSurvey}
        loading={deleting}
        entity={surveyToDelete}
        entityType="survey"
        title="Delete Survey"
        description="This action is irreversible. The survey and its links will be permanently deleted."
        warningItems={[
          "All associated questions will remain, but the link to this survey will be removed.",
          "Results and participations related to this survey will be lost.",
          "There will be no way to restore this data after deletion."
        ]}
        entityDisplay={(survey) => ({
          avatar: survey.title?.charAt(0).toUpperCase(),
          name: survey.title,
          subtitle: survey.description
        })}
      />

      <EditSurveyModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        survey={selectedSurvey}
        onSuccess={async () => {
          const updated = await surveyService.getAllSurveys();
          setSurveysLocal(updated);
          setSelectedSurvey(updated.find(s => s.surveyId === selectedSurvey.surveyId));
          setShowEditModal(false);
        }}
      />

      <LockConfirmationModal
        open={showLockModal}
        onClose={() => {
          setShowLockModal(false);
          setSurveyToToggleLock(null);
        }}
        onConfirm={async () => {
          if (!surveyToToggleLock) return;
          const id = surveyToToggleLock.surveyId;
          const locked = surveyToToggleLock.locked;
          setShowLockModal(false);
          try {
            await handleToggleLockSurvey(id, locked);
          } finally {
            setSurveyToToggleLock(null);
          }
        }}
        loading={loading}
        entity={surveyToToggleLock}
        entityType="survey"
      />

      <ViewSurveyModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSurvey(null);
        }}
        survey={selectedSurvey}
        onAddQuestions={handleAddQuestionsClick}
        showQuestionsList={showQuestionsList}
        questions={questions}
        onAddQuestionToSurvey={handleAddQuestionToSurvey}
        reloadGlobalQuestions={reloadAndFetchQuestions}
        setPublishErrorMessage={setPublishErrorMessage} 
        setShowErrorModal={setShowErrorModal}  
      />
      <ErrorInfoModal 
      open={showErrorModal} 
      onClose={() => setShowErrorModal(false)} 
      message={publishErrorMessage}/>
    </div>
  );
};

export default SurveysSection;