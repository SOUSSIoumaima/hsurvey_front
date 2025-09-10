import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Lock, Unlock, Search, Trash2, ImageOff, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../common/Button";
import { questionService } from "../../services/questionService";
import CreateQuestionModal from "./CreateQuestionModal";
import EditQuestionModal from "./EditQuestionModal";
import LockConfirmationModal from "./LockConfirmationModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { ClipboardList } from "lucide-react";
import ErrorInfoModal from "./ErrorInfoModal";

const QuestionsSection = ({ reload }) => {
  const [questions, setQuestions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [questionToToggleLock, setQuestionToToggleLock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Search, filter, and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("subject");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await questionService.getAllQuestions();
        setQuestions(res);
      } catch (err) {
        console.error("Error while fetching questions:", err);
      }
    };

    fetchQuestions();
  }, [reload]);

  // Filter, sort, and paginate questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter(q => {
      const matchesSearch =
        q.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || 
        (statusFilter === "locked" && q.locked) ||
        (statusFilter === "unlocked" && !q.locked);
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "subject":
          aValue = a.subject?.toLowerCase() || '';
          bValue = b.subject?.toLowerCase() || '';
          break;
        case "questionText":
          aValue = a.questionText?.toLowerCase() || '';
          bValue = b.questionText?.toLowerCase() || '';
          break;
        case "status":
          aValue = a.locked ? "locked" : "unlocked";
          bValue = b.locked ? "locked" : "unlocked";
          break;
        default:
          aValue = a.subject?.toLowerCase() || '';
          bValue = b.subject?.toLowerCase() || '';
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [questions, searchTerm, sortBy, sortOrder, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = filteredAndSortedQuestions.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

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
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
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

  const handleEditQuestion = async (updatedData) => {
    try {
      const updated = await questionService.updateQuestion(updatedData.questionId, updatedData);
      setQuestions((prev) =>
        prev.map((q) => (q.questionId === updated.questionId ? updated : q)));
      setShowEditModal(false);
      setEditQuestion(null);
    } catch (err) {
    console.error("Error updating question:", err);
    const msg = err?.response?.data?.message || "An error occurred";

    setErrorMessage(msg);
    setShowErrorModal(true);
    setShowEditModal(false);
    setEditQuestion(null);
  }
  };

  const handleSubmitQuestion = async (formData) => {
    try {
      const created = await questionService.createQuestion(formData);
      setQuestions((prev) => [...prev, created]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating question:", err);
    }
  };

  const handleToggleLockQuestion = async (questionId, isCurrentlyLocked) => {
    try {
      if (isCurrentlyLocked) {
        await questionService.unlockQuestion(questionId);
      } else {
        await questionService.lockQuestion(questionId);
      }

      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === questionId ? { ...q, locked: !isCurrentlyLocked } : q
        )
      );
    } catch (error) {
      console.error("Error toggling question lock:", error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
  try {
    setLoadingDelete(true);
    await questionService.deleteQuestion(questionId);
    setQuestions((prev) => prev.filter(q => q.questionId !== questionId));
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  } catch (error) {
    console.error("Error deleting question:", error);

    let msg = error?.response?.data?.message || "An error occurred";

    // Si le message concerne une contrainte de clé étrangère
    if (msg.includes("violates foreign key constraint") || msg.includes("assigned_questions")) {
      msg = "This question exists in a survey and cannot be deleted";
    }

    setErrorMessage(msg);
    setShowErrorModal(true);
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  } finally {
    setLoadingDelete(false);
  }
};

  return (
    <div className="space-y-4">
      {/* Compact Header with integrated controls */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Question Management</h2>
              <p className="text-sm text-gray-500">Manage your list of questions and their settings</p>
            </div>
          </div>
          
          {/* Create Button */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Question
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
                placeholder="Search questions by subject or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-800 text-sm transition-all duration-200 hover:border-amber-300"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 hover:border-amber-300"
              >
                <option value="">All Status</option>
                <option value="unlocked">Unlocked</option>
                <option value="locked">Locked</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 hover:border-amber-300"
              >
                <option value="subject">Sort by Subject</option>
                <option value="questionText">Sort by Content</option>
                <option value="status">Sort by Status</option>
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
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedQuestions.length)} of {filteredAndSortedQuestions.length}
            </span>
            <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
              {questions.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
          {currentQuestions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter ? "Try adjusting your search criteria" : "Get started by creating your first question"}
                </p>
                {!searchTerm && !statusFilter && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Question
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {currentQuestions.map((q) => (
                <div
                  key={q.id || q.questionId}
                  className="p-5 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white hover:shadow-lg hover:border-amber-200 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                          <span className="text-white text-sm font-semibold">
                            {q.subject?.charAt(0).toUpperCase() || 'Q'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                          {q.subject}
                        </h3>
                        <div className="flex items-center gap-2">
                          {q.locked ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <Unlock className="w-3 h-3 mr-1" />
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-base text-gray-700 leading-relaxed mb-3">
                        {q.questionText}
                      </p>
                      
                      {/* Options */}
                      {q.options?.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">Answer Options:</h4>
                          <ul className="space-y-1">
                            {q.options.map((opt, idx) => (
                              <li key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">{opt.optionText}</span>
                                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Score: {opt.optionScore}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200 border border-amber-200 hover:border-amber-300 hover:shadow-md"
                        title="Edit Question"
                        onClick={() => {
                          setEditQuestion(q);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-all duration-200 border hover:shadow-md ${
                          q.locked
                            ? "text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                            : "text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300"
                        }`}
                        title={q.locked ? "Unlock Question" : "Lock Question"}
                        onClick={() => {
                          setQuestionToToggleLock(q);
                          setShowLockModal(true);
                        }}
                      >
                        {q.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300 hover:shadow-md disabled:opacity-50"
                        title="Delete Question"
                        onClick={() => {
                          setQuestionToDelete(q);
                          setShowDeleteModal(true);
                        }}
                        disabled={loadingDelete}
                      >
                        {loadingDelete && questionToDelete?.questionId === q.questionId ? (
                          <div className="w-4 h-4 animate-spin border-2 border-red-400 border-t-transparent rounded-full"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Modals */}
      <CreateQuestionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitQuestion}
      />

      <EditQuestionModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        question={editQuestion}
        onSubmit={handleEditQuestion}
      />

      <LockConfirmationModal
        open={showLockModal}
        onClose={() => {
          setShowLockModal(false);
          setQuestionToToggleLock(null);
        }}
        onConfirm={async () => {
          if (!questionToToggleLock) return;
          const id = questionToToggleLock.questionId;
          const locked = questionToToggleLock.locked;
          setShowLockModal(false);
          try {
            await handleToggleLockQuestion(id, locked);
          } finally {
            setQuestionToToggleLock(null);
          }
        }}
        loading={loading}
        entity={questionToToggleLock}
        entityType="question"
      />

      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setQuestionToDelete(null);
        }}
        onConfirm={async () => {
          if (!questionToDelete) return;
          await handleDeleteQuestion(questionToDelete.questionId);
        }}
        loading={loadingDelete}
        entity={questionToDelete}
        entityType="question"
      />

      <ErrorInfoModal
      open={showErrorModal}
      onClose={() => setShowErrorModal(false)}
      message={errorMessage}
      />
    </div>
  );
};

export default QuestionsSection;