import React, { useState, useEffect } from "react";
import { FileText, X } from "lucide-react";
import Button from "../common/Button";
import { surveyService } from "../../services/surveyService";

const EditSurveyModal = ({ open, onClose, survey, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "FEEDBACK",
    status: "DRAFT",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (survey) {
      setForm({
        title: survey.title || "",
        description: survey.description || "",
        type: survey.type || "FEEDBACK",
        status: survey.status || "DRAFT",
        deadline: survey.deadline?.slice(0, 16) || "",
      });
    }
  }, [survey]);

  if (!open || !survey) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await surveyService.updateSurvey(survey.surveyId, form);
      onSuccess?.(); // pour rafraîchir la liste
      onClose(); // fermer la modal
    } catch (err) {
      setError(err.response?.data?.message || "Error updating survey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-slide-up border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Edit Survey</h3>
            <p className="text-gray-600 mt-1">Update survey details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter survey title"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="Survey description"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-semibold text-gray-700">
              Deadline
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm animate-shake">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              label="Cancel"
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              label="Update Survey"
              loading={loading}
              className="flex-1"
            />
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default EditSurveyModal;
