import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { surveyService } from "../../services/surveyService";
import { questionService } from "../../services/questionService";

const SurveyBankDetails = ({ surveyId }) => {
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = useCallback(
    async (assignedQuestions = []) => {
      if (!assignedQuestions || assignedQuestions.length === 0) {
        setQuestions([]);
        return;
      }
      try {
        const promises = assignedQuestions.map((q) =>
          questionService.getQuestionById(q.questionId)
        );
        const results = await Promise.all(promises);
        setQuestions(results);
      } catch (error) {
        console.error("Error fetching questions", error);
      }
    },
    []
  );

  useEffect(() => {
    if (!surveyId) return;
    const fetchSurveyAndQuestions = async () => {
      try {
        const surveyData = await surveyService.getSurveyById(surveyId);
        setSurvey(surveyData);
        await fetchQuestions(surveyData.assignedQuestions);
      } catch (error) {
        console.error("Error fetching survey or questions:", error);
      }
    };
    fetchSurveyAndQuestions();
  }, [surveyId, fetchQuestions]);

  if (!survey) {
    return (
      <div className="text-center mt-8 text-gray-600">Loading survey...</div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{survey.title}</h1>
      <p className="text-gray-600 mb-6">{survey.description}</p>
      <p className="text-sm text-gray-500 mb-2">
        Status:{" "}
        <span
          className={
            survey.status === "DRAFT" ? "text-yellow-600" : "text-green-600"
          }
        >
          {survey.status}
        </span>
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Deadline:{" "}
        {survey.deadline ? new Date(survey.deadline).toLocaleString() : "None"}
      </p>

      <h2 className="text-xl font-semibold text-gray-700 mb-3">
        Assigned Questions
      </h2>

      {questions.length === 0 ? (
        <p className="text-gray-500 italic">No questions assigned to this survey.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.questionId} className="p-4 bg-gray-50 rounded border">
              <p className="font-medium text-gray-800 mb-2">
                Question: {question.questionText}
              </p>
              {question.options?.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {question.options.map((opt) => (
                    <li key={opt.optionId}>{opt.optionText}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">No options available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyBankDetails;
