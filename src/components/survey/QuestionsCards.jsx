import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Button from "../common/Button";
import { questionService } from "../../services/questionService";

const QuestionsCards = ({ questions, onAddToSurvey }) => {
  const [searchSubject, setSearchSubject] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState(questions || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilteredQuestions(questions);
  }, [questions]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchSubject(value);
    setLoading(true);

    try {
      if (value.trim() === "") {
        const allQuestions = await questionService.getAllQuestions();
        setFilteredQuestions(allQuestions);
      } else {
        const results = await questionService.getBySubject(value);
        setFilteredQuestions(results);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche", error);
      setFilteredQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-base">
      {/* Zone de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par sujet..."
          value={searchSubject}
          onChange={handleSearchChange}
          className="p-2 border rounded w-full"
        />
      </div>

      {/* Cartes de questions */}
      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      ) : filteredQuestions.length > 0 ? (
        <div className="grid gap-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id || question.questionId}
              className="border rounded-lg p-4 shadow-sm bg-white flex justify-between items-start"
            >
              <div className="flex-1 pr-4">
                <div className="text-sm text-gray-500 mb-1 font-semibold">
                  {question.subject}
                </div>
                <div className="text-base font-medium mb-2">
                  {question.questionText}
                </div>
                {question.options?.length > 0 ? (
                  <ul className="list-disc pl-4 text-sm text-gray-700">
                    {question.options.map((option, idx) => (
                      <li key={idx}>
                        {option.optionText} ({option.optionScore})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm italic text-gray-400">
                    No options
                  </div>
                )}
              </div>

              {/* Bouton à droite */}
              <div className="ml-4">
                <Button
                  icon={Plus}
                  variant="primary"
                  onClick={() => onAddToSurvey(question.questionId)}
                >
                  Add to Survey
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic py-4">
          No questions found
        </div>
      )}
    </div>
  );
};

export default QuestionsCards;
