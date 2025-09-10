import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ErrorInfoModal = ({ open, onClose, message }) => {
  if (!open || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative transform transition-all duration-300 scale-100 animate-slide-up border border-gray-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Error</h3>
          </div>
        </div>

        {/* Message Content */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Reason</h4>
              <p className="text-yellow-700 text-sm">{message}</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-gray-300 to-gray-400 text-white hover:from-gray-400 hover:to-gray-500 transition shadow hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ErrorInfoModal;