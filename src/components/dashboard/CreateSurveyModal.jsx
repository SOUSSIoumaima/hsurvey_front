import React, { useEffect } from "react";
import { X, FileText } from "lucide-react";
import SurveyForm from "../survey/SurveyForm";

const CreateSurveyModal = ({ open, onClose, form, setForm, onSubmit, loading, error }) => {
  // Réinitialise le formulaire à l'ouverture de la modal
  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        description: "",
        type: "FEEDBACK",
        responseType: "ALL_IN_ONE_PAGE",
        status: "DRAFT",
        deadline: "",
        locked: false,
      });
    }
  }, [open, setForm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl relative animate-slide-up border border-gray-200 mx-4 max-h-[90vh] overflow-hidden">
        
        {/* Slim Header */}
        <div className="relative bg-white border-b border-gray-200 px-6 py-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header content */}
          <div className="flex items-center gap-3 pr-12">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-sky-500 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Create New Survey</h3>
              <p className="text-sm text-gray-500">Configure your survey settings</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Survey Form with modern styling */}
          <SurveyForm
            form={form}
            setForm={setForm}
            onSubmit={onSubmit}
            loading={loading}
            error={error}
          />
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
            <div className="flex items-center gap-2 bg-white shadow-md rounded-lg px-4 py-3 border border-gray-200">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-500 border-t-transparent"></div>
              <span className="text-gray-700 text-sm">Creating survey...</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateSurveyModal;