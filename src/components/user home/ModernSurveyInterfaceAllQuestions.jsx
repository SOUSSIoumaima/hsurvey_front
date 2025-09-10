import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { apiService } from '../../services/apiService';

const ModernSurveyInterfaceAllQuestions = ({ survey, onClose, onComplete }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [questionStatus, setQuestionStatus] = useState({});
  const questionRefs = useRef([]);

  // Calcul du temps restant
  useEffect(() => {
    if (!survey?.deadline) return;

    function updateTimeLeft() {
      const now = new Date();
      const deadline = new Date(survey.deadline);
      const diffMs = deadline - now;

      if (diffMs <= 0) {
        setTimeLeft('Deadline dépassée');
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

      let text = '';
      if (diffDays > 0) text += `${diffDays}j `;
      if (diffHours > 0) text += `${diffHours}h `;
      if (diffMinutes > 0) text += `${diffMinutes}min`;

      setTimeLeft(text.trim());
    }

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [survey?.deadline]);

  if (!survey) return null;

  const totalQuestions = survey.questions?.length || 0;
  const progress =
    totalQuestions > 0 ? (Object.keys(userAnswers).length / totalQuestions) * 100 : 0;

  const handleTextChange = (questionId, value) => {
    setUserAnswers({ ...userAnswers, [questionId]: value });
  };

  const handleOptionSelect = (questionId, optionId, isMultiple) => {
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

  const markQuestionAsUncertain = (questionId) => {
    setQuestionStatus({ ...questionStatus, [questionId]: 'uncertain' });
  };

  const markQuestionForReview = (questionId) => {
    setQuestionStatus({ ...questionStatus, [questionId]: 'review' });
  };

  const buildSurveyResponseDto = () => {
    return {
      surveyId: survey.surveyId,
      questionResponses: survey.questions.map((q) => {
        const answer = userAnswers[q.id];

        if (q.type === 'FREE_TEXT' || q.type === 'DATE_PICKER') {
          return {
            questionId: q.id,
            questionText: q.text,
            optionResponses: [
              {
                optionId: null,
                optionText: answer || '',
                selected: !!answer,
                optionScore: null,
              },
            ],
          };
        }

        if (q.options?.length > 0) {
          return {
            questionId: q.id,
            questionText: q.text,
            optionResponses: q.options.map((opt) => ({
              optionId: opt.optionId,
              optionText: opt.text,
              correct: opt.correct,
              selected:
                q.type === 'MULTIPLE_CHOICE_TEXT'
                  ? (answer || []).includes(opt.optionId)
                  : answer === opt.optionId,
              optionScore: opt.optionScore,
            })),
          };
        }

        return {
          questionId: q.id,
          questionText: q.text,
          optionResponses: [],
        };
      }),
    };
  };

  const handleProceedToReview = async () => {
    const surveyResponseDto = buildSurveyResponseDto();
    try {
      const savedResponse = await apiService.submitSurveyResponse(surveyResponseDto);
      onComplete?.(savedResponse.surveyResponseId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde', error);
      alert('Impossible de sauvegarder les réponses.');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6 max-w-[calc(100%-2rem)] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors px-4 py-2 bg-black/20 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6 mr-2 inline" />
            Home
          </button>
          <div className="text-center flex-1 px-4">
            <h1 className="text-3xl font-bold text-white">{survey?.title}</h1>
            <p className="text-purple-200 mt-1">{survey?.description}</p>
          </div>
        </div>

        {survey.deadline && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mt-2 border border-white/20 text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">Deadline</span>
            <span className="ml-2">{new Date(survey.deadline).toLocaleString()}</span>
            {timeLeft && <span className="ml-4 text-purple-200">({timeLeft} restant)</span>}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-white mb-2 px-2">
            <span>{totalQuestions} Questions</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {survey.questions?.map((q, idx) => (
          <div
            key={q.id || idx}
            ref={(el) => (questionRefs.current[idx] = el)}
            className="bg-white rounded-xl shadow-lg p-6 border"
          >
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                {idx + 1}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{q.text}</h2>
                {q.description && <p className="text-gray-600 mt-1">{q.description}</p>}
              </div>
            </div>

            {/* Question Input / Options */}
            {q.type === 'FREE_TEXT' ? (
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your answer..."
                rows={4}
                value={userAnswers[q.id] || ''}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
              />
            ) : q.type === 'DATE_PICKER' ? (
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userAnswers[q.id] || ''}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
              />
            ) : (
              <div className="space-y-3">
                {q.options?.map((opt) => (
                  <label
                    key={opt.optionId}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type={
                        q.type === 'MULTIPLE_CHOICE_TEXT' ? 'checkbox' : 'radio'
                      }
                      name={`question-${q.id}`}
                      value={opt.optionId}
                      checked={
                        q.type === 'MULTIPLE_CHOICE_TEXT'
                          ? userAnswers[q.id]?.includes(opt.optionId) || false
                          : userAnswers[q.id] === opt.optionId
                      }
                      onChange={() =>
                        handleOptionSelect(
                          q.id,
                          opt.optionId,
                          q.type === 'MULTIPLE_CHOICE_TEXT'
                        )
                      }
                      className="w-5 h-5 mr-3 text-blue-600"
                    />
                    <span className="text-gray-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Buttons for Uncertain / Review */}
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => markQuestionAsUncertain(q.id)}
                className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
              >
                Uncertain
              </button>
              <button
                onClick={() => markQuestionForReview(q.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-right">
        <button
          onClick={handleProceedToReview}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition"
        >
          Review Answers
        </button>
      </div>

      {/* Fixed Right Navigation Panel */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white border-opacity-20 p-4 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Questions</h3>
          <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>

        <div className="space-y-3">
          {survey.questions?.map((q, index) => {
            const isAnswered = !!userAnswers[q.id];
            const status = questionStatus[q.id] || (isAnswered ? 'answered' : 'unanswered');

            return (
              <div
                key={q.id || index}
                onClick={() =>
                  questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className={`relative cursor-pointer transition-all duration-200 group hover:scale-105`}
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                    ${status === 'answered' ? 'bg-green-500' : ''}
                    ${status === 'unanswered' ? 'bg-red-500' : ''}
                    ${status === 'uncertain' ? 'bg-yellow-500' : ''}
                    ${status === 'review' ? 'bg-blue-500' : ''}
                  `}
                >
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Answered</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Unanswered</span>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uncertain</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Review</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSurveyInterfaceAllQuestions;
