import React, { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import Button from "../common/Button";
import { questionService } from "../../services/questionService";
import { surveyService } from "../../services/surveyService";
import CreateQuestionModal from "../dashboard/CreateQuestionModal";
import AddQuestionModal from "../dashboard/AddQuestionModal";
import DeleteConfirmationModal from "../dashboard/DeleteConfirmationModal";
import ErrorInfoModal from "../dashboard/ErrorInfoModal";

const SurveyDetails = ({ survey, onAddQuestions, reloadGlobalQuestions }) => {
  const [questions, setQuestions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [globalQuestions, setGlobalQuestions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);


  const fetchQuestions = useCallback(async (assignedQuestions = survey.assignedQuestions) => {
  if (!survey || !assignedQuestions) return;
  try {
    const promises = assignedQuestions.map((q) =>
      questionService.getQuestionById(q.questionId)
    );
    const results = await Promise.all(promises);
    // Fusionner avec assignedQuestionId
    const merged = results.map((q, index) => ({
      ...q,
      assignedQuestionId: assignedQuestions[index].assignedQuestionId
    }));
    setQuestions(merged);
  } catch (error) {
    console.error("Error fetching questions", error);
  }
}, [survey]);

  useEffect(() => {
    if (survey?.assignedQuestions?.length > 0) {
      fetchQuestions(survey.assignedQuestions);
    } else {
      setQuestions([]);
    }
  }, [survey, fetchQuestions]);

  useEffect(() => {
  if (showAddModal) {
    questionService.getAllQuestions()
      .then(setGlobalQuestions)
      .catch((error) => console.error("Erreur chargement questions globales", error));
  }
}, [showAddModal]);

  
  const handleAssign = async (questionId) => {
  try {
    await surveyService.assignQuestionToSurvey(survey.surveyId, questionId);
    const updatedSurvey = await surveyService.getSurveyById(survey.surveyId);
    await fetchQuestions(updatedSurvey.assignedQuestions);
  } catch (error) {
    console.error("Erreur lors de l'assignation", error);
    // Récupérer le message d'erreur du backend
    const message = error?.response?.data?.message || error.message || "An unexpected error occurred";
    setErrorMessage(message);
    setShowError(true);
  }
};


  const confirmDeleteQuestion = async () => {
  if (!questionToDelete) return;
  try {
    await surveyService.unassignQuestionFromSurvey(survey.surveyId, questionToDelete.assignedQuestionId);
    setQuestions((prev) => prev.filter(q => q.questionId !== questionToDelete.questionId));
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  } catch (error) {
    console.error("Error deleting question", error);
    const message = error?.response?.data?.message || error.message || "An unexpected error occurred";
    setErrorMessage(message);
    setShowError(true);
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  }};

 

  const handleCreateQuestionAndAssign = async (questionData) => {
    try {
      const createdQuestion = await questionService.createQuestion({
        ...questionData,
      organizationId: survey.organizationId,
      });

      await surveyService.assignQuestionToSurvey(survey.surveyId, createdQuestion.questionId);
      setQuestions(prev =>[...prev,createdQuestion]);

      if (reloadGlobalQuestions) {
        await reloadGlobalQuestions();
      }

      const updatedSurvey = await surveyService.getSurveyById(survey.surveyId);
      await fetchQuestions(updatedSurvey.assignedQuestions);

    } catch (error) {
      console.error("Error creating and assigning question", error);
    }
  };

  if (!survey) return null;

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-6">
      

      
      <div className="space-y-2 text-gray-600">
        <h2 className="text-2xl font-semibold text-gray-700">Survey Details</h2>
        <p><strong>Title:</strong> {survey.title}</p>
        <p><strong>Description:</strong> {survey.description}</p>
        <p><strong>Status:</strong> <span className={`font-medium ${survey.status === "DRAFT" ? "text-yellow-600" : "text-green-600"}`}>{survey.status}</span></p>
        <p><strong>Questions:</strong> {questions.length > 0 ? questions.length : "None"}</p>
        <p><strong>Deadline:</strong> {survey.deadline ? new Date(survey.deadline).toLocaleString() : "None"}</p>

      </div>

      
      <div className="space-y-4">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.questionId}
                className="p-4 bg-gray-50 rounded-lg border hover:shadow transition relative"
              >
                <button
                onClick={() => {
                  setQuestionToDelete(question);
                  setShowDeleteModal(true);
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                title="Remove question">
                  <Trash2 size={18} />
                </button>

                <p className="font-medium text-gray-800 mb-2">Question : {question.questionText}</p>

                {question.options && question.options.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {question.options.map((option) => (
                      <li key={option.optionId}>
                        {option.optionText}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">No options available</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">No questions assigned</p>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button onClick={() => setShowCreateModal(true)}>Create New Question</Button>
        <Button onClick={() => setShowAddModal(true)}>Add Existing Questions</Button>
      </div>
      <AddQuestionModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      questions={globalQuestions}
      onAssign={handleAssign}
      />
      <CreateQuestionModal
      open={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onSubmit={handleCreateQuestionAndAssign}
      />

      <DeleteConfirmationModal
      open={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setQuestionToDelete(null);
      }}
      onConfirm={confirmDeleteQuestion}
      loading={false}
      entity={questionToDelete}
      entityType="question"
      title="Remove Question from Survey"
      description="This will unassign the question from this survey only"
      warningItems={["This question will be removed from this survey",
        "It will remain available globally",
        "This operation is immediate"
      ]}
      entityDisplay={(question) => ({
        avatar: question.questionText?.charAt(0).toUpperCase(),
        name: question.questionText,
        subtitle: question.options?.map(opt => opt.optionText).join(', ') || "No options"
        })}/>

        <ErrorInfoModal 
        open={showError} 
        onClose={() => setShowError(false)} 
        message={errorMessage} />

  


    </div>
  );
};

export default SurveyDetails;
