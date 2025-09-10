import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const SurveyReview = ({ surveyResponseId }) => {
  const navigate = useNavigate();
  const [surveyResponse, setSurveyResponse] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const questionRefs = useRef([]);

  useEffect(() => {
    const fetchSurveyResponse = async () => {
      try {
        const response = await apiService.getSurveyResponseById(surveyResponseId);
        setSurveyResponse(response);

        const answers = {};
        response.questionResponses.forEach((qr) => {
          if (qr.optionResponses?.length > 0) {
            if (qr.optionResponses.length === 1 && qr.optionResponses[0].optionId === null) {
              answers[qr.questionId] = qr.optionResponses[0].optionText || '';
            } else {
              const selectedOptions = qr.optionResponses.filter((opt) => opt.selected).map((opt) => opt.optionId);
              answers[qr.questionId] = selectedOptions.length > 1 ? selectedOptions : selectedOptions[0];
            }
          }
        });
        setUserAnswers(answers);
      } catch (err) {
        console.error('Error fetching survey response:', err);
        alert('Failed to load survey response');
      } finally {
        setLoading(false);
      }
    };

    if (surveyResponseId) fetchSurveyResponse();
  }, [surveyResponseId]);

  const handleOptionChange = (questionId, optionId, isMultiple) => {
    if (isMultiple) {
      const prev = userAnswers[questionId] || [];
      setUserAnswers({
        ...userAnswers,
        [questionId]: prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      });
    } else {
      setUserAnswers({ ...userAnswers, [questionId]: optionId });
    }
  };

  const handleTextChange = (questionId, value) => {
    setUserAnswers({ ...userAnswers, [questionId]: value });
  };

  const handleFinalSubmit = async () => {
    if (!surveyResponse) return;
    setSubmitting(true);

    const finalDto = {
      surveyId: surveyResponse.surveyId,
      questionResponses: surveyResponse.questionResponses.map((q) => {
        const answer = userAnswers[q.questionId];

        if (q.optionResponses.length === 1 && q.optionResponses[0].optionId === null) {
          return {
            questionId: q.questionId,
            questionText: q.questionText,
            optionResponses: [
              { optionId: null, optionText: answer || '', selected: !!answer, optionScore: null },
            ],
          };
        }

        return {
          questionId: q.questionId,
          questionText: q.questionText,
          optionResponses: q.optionResponses.map((opt) => ({
            optionId: opt.optionId,
            optionText: opt.optionText,
            selected: Array.isArray(answer) ? answer.includes(opt.optionId) : answer === opt.optionId,
            optionScore: opt.optionScore,
            correct: opt.correct,
          })),
        };
      }),
    };

    try {
      await apiService.updateSurveyResponse(surveyResponseId, finalDto);
      navigate('/user-home');
    } catch (err) {
      console.error('Error submitting final survey response:', err);
      alert('Failed to submit survey responses.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey review...</p>
        </div>
      </div>
    );

  if (!surveyResponse)
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Survey response not found.</p>
      </div>
    );

  const totalQuestions = surveyResponse.questionResponses.length;
  const answeredCount = Object.keys(userAnswers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 max-w-[calc(100%-2rem)] mx-auto">
      {/* Header with Green Gradient */}
      <div className="bg-gradient-to-br from-green-600 via-lime-600 to-green-800 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          
          <div className="text-center flex-1 px-4">
            <h1 className="text-3xl font-bold text-white">{surveyResponse.surveyTitle}</h1>
            <p className="text-green-200 mt-1">Review and finalize your answers</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-white mb-2 px-2">
            <span>{totalQuestions} Questions</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-lime-400 to-green-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        {surveyResponse.questionResponses.map((q, idx) => (
          <div
            key={q.questionResponseId}
            ref={(el) => (questionRefs.current[idx] = el)}
            className="bg-white rounded-xl shadow-lg p-6 border"
          >
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">{q.questionText}</h2>
              </div>
            </div>

            {q.optionResponses.length === 1 && q.optionResponses[0].optionId === null ? (
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                value={userAnswers[q.questionId] || ''}
                onChange={(e) => handleTextChange(q.questionId, e.target.value)}
              />
            ) : (
              <div className="space-y-2">
                {q.optionResponses.map((opt) => (
                  <label
                    key={opt.optionId}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type={Array.isArray(userAnswers[q.questionId]) ? 'checkbox' : 'radio'}
                      name={`question-${q.questionId}`}
                      checked={
                        Array.isArray(userAnswers[q.questionId])
                          ? userAnswers[q.questionId].includes(opt.optionId)
                          : userAnswers[q.questionId] === opt.optionId
                      }
                      onChange={() =>
                        handleOptionChange(q.questionId, opt.optionId, Array.isArray(userAnswers[q.questionId]))
                      }
                      className="w-4 h-4 mr-3 text-green-600"
                    />
                    <span className="text-gray-700">{opt.optionText}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Final Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleFinalSubmit}
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : <><Send className="w-5 h-5 inline mr-2" /> Submit Final Survey</>}
        </button>
      </div>
    </div>
  );
};

export default SurveyReview;
