import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  loading, 
  entity, 
  entityType = 'user',
  title,
  description,
  warningItems = [],
  entityDisplay
}) => {
  if (!open || !entity) return null;

  
  const getEntityConfig = (type) => {
    const configs = {
      user: {
        title: 'Delete User',
        description: 'This action cannot be undone',
        warningItems: [
          'Remove all user data and permissions',
          'Revoke access to all systems',
          'Cannot be recovered once deleted'
        ],
        entityDisplay: (user) => ({
          avatar: user.username?.charAt(0).toUpperCase(),
          name: user.username,
          subtitle: user.email
        })
      },
      role: {
        title: 'Delete Role',
        description: 'This action cannot be undone',
        warningItems: [
          'Remove role and all its permissions',
          'Users with this role will lose access',
          'Cannot be recovered once deleted'
        ],
        entityDisplay: (role) => ({
          avatar: role.name?.charAt(0).toUpperCase(),
          name: role.name,
          subtitle: role.description
        })
      },
      survey: {
        title: 'Delete Survey',
        description: 'This action cannot be undone',
        warningItems: [
          'All related questions associations will be lost',
          'Existing responses (if any) will be removed',
          'This operation is irreversible'
        ],
        entityDisplay: (survey) => ({
          avatar: survey.title?.charAt(0).toUpperCase(),
          name: survey.title,
          subtitle: survey.description
        })
      },
      question: {
        title: 'Delete Question',
        description: 'This action cannot be undone',
        warningItems: [
          'All related options will be lost',
          'Cannot be recovered once deleted'
        ],
        entityDisplay: (question) => ({
          avatar: question.subject?.charAt(0).toUpperCase(),
          name: question.subject || question.questionText,
          subtitle: question.questionText
        })
      } 
    };
    return configs[type] || configs.user;
  };

  const config = getEntityConfig(entityType);
  const display = entityDisplay ? entityDisplay(entity) : config.entityDisplay(entity);

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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Trash2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{title || config.title}</h3>
            <p className="text-gray-600 mt-1">{description || config.description}</p>
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-2">Permanent Deletion Warning</h4>
              <p className="text-red-700 text-sm mb-3">
                You are about to permanently delete{' '}
                <span className="font-semibold">{display.name}</span>. This will:
              </p>
              <ul className="text-red-700 text-sm space-y-1 ml-4">
                {warningItems.length > 0 ? warningItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {item}
                  </li>
                )) : config.warningItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Entity Info Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {display.avatar}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">{display.name}</div>
              <div className="text-sm text-gray-600">{display.subtitle}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Delete {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom Animations */}
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

export default DeleteConfirmationModal;