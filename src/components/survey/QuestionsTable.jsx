import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Button from "../common/Button";
import { questionService } from "../../services/questionService"; 

const QuestionsTable = ({ questions, onAddToSurvey }) => {
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
    console.error("Erreur lors de la recherche par sujet", error);
    setFilteredQuestions([]); 
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="overflow-y-auto border rounded p-2">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par sujet..."
          value={searchSubject}
          onChange={handleSearchChange}
          className="p-2 border rounded w-full"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="text-center text-gray-500">Loading...</div>
          ) : filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
           <div
           key={question.id || question.questionId}
           className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
           >
            <h3 className="text-lg font-semibold text-gray-800">
              {question.subject}
              </h3>
              <p className="text-gray-600 mb-2">{question.questionText}</p>
              <div className="mb-2">
                {question.options?.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {question.options.map((option, idx) => (
                      <li key={idx}>
                        {option.optionText} ({option.optionScore})
                      </li>
                    ))}
                  </ul>
                  ) : (
                  <span className="text-gray-400 italic">No options</span>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                  icon={Plus}
                  variant="primary"
                  onClick={() => {
                    console.log("Clicked Add to Survey for questionId:", question.questionId || question.id);
                    onAddToSurvey(question.questionId || question.id);
                  }}>Add to Survey
                  </Button>
                </div>
              </div>
              ))
            ) : (
            <div className="text-center text-gray-500 italic">No questions found</div>
            )}
          </div>

    </div>
  );
};

export default QuestionsTable;
