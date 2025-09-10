import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModernSurveyInterfaceAllQuestions from '../components/user home/ModernSurveyInterfaceAllQuestions';
import SurveyReview from '../components/user home/SurveyReview';
import { apiService } from '../services/apiService';
import NavBar from '../components/common/NavBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModernSurveyInterfaceOneByOne from '../components/user home/ModernSurveyInterfaceOneByOne';

const SurveyPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState(false); 
  const [surveyResponseId, setSurveyResponseId] = useState(null); 

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const fullSurvey = await apiService.getSurveyById(surveyId);

        const questions = await Promise.all(
          fullSurvey.assignedQuestions.map(async (assignedQuestion) => {
            const qRaw = await apiService.getQuestionById(assignedQuestion.questionId);
            const optionsRaw = await apiService.getOptionsByQuestionId(assignedQuestion.questionId)
              .catch(() => []);
            return {
              id: qRaw.questionId,
              text: qRaw.questionText,
              type: qRaw.questionType,
              options: optionsRaw.map(opt => ({
                optionId: opt.optionId,
                text: opt.optionText,
                optionScore: opt.optionScore ?? 0,
                correct: opt.correct ?? false
              }))
            };
          })
        );

        fullSurvey.questions = questions;
        setSurvey(fullSurvey);
      } catch (err) {
        console.error(err);
        alert('Failed to load survey');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading survey..." />
        </div>
      </div>
    );
  }

  if (!survey) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode réponse */}
        {/* Mode réponse */}
{!reviewMode && survey && (
  survey.responseType === 'ONE_BY_ONE' ? (
    <ModernSurveyInterfaceOneByOne
      survey={survey}
      onClose={() => navigate(-1)}
      onComplete={(savedResponseId) => {
        setSurveyResponseId(savedResponseId);
        setReviewMode(true);                  
      }}
    />
  ) : (
    <ModernSurveyInterfaceAllQuestions
      survey={survey}
      onClose={() => navigate(-1)}
      onComplete={(savedResponseId) => {
        setSurveyResponseId(savedResponseId);
        setReviewMode(true);                  
      }}
    />
  )
)}

        {/* Mode review */}
        {reviewMode && surveyResponseId && (
          <SurveyReview
            surveyResponseId={surveyResponseId}
          />
        )}
      </div>
    </div>
  );
};

export default SurveyPage;