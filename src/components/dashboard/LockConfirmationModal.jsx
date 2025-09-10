import React from 'react';
import { X, Lock, Unlock, AlertTriangle } from 'lucide-react';

const LockConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  entity,
  entityType = 'question',
  title,
  description,
  warningItems = [],
  entityDisplay
}) => {
  if (!open || !entity) return null;

  const isLocked = entity.locked;

  const getEntityConfig = (type) => {
    const base = {
      lock: {
        title: `Lock ${type === 'survey' ? 'Survey' : 'Question'}`,
        description: 'Locked entities cannot be modified or deleted.',
        warningItems: [
          'Prevent editing content',
          'Restrict deletion',
          'Require unlocking before further changes'
        ]
      },
      unlock: {
        title: `Unlock ${type === 'survey' ? 'Survey' : 'Question'}`,
        description: 'Unlocked entities can be edited or deleted.',
        warningItems: [
          'Allow editing',
          'Enable deletion',
          'May affect linked data'
        ]
      }
    };

    const display = (e) => ({
      avatar: (e.title || e.subject)?.charAt(0).toUpperCase(),
      name: e.title || e.subject,
      subtitle: e.description || e.questionText
    });

    return {
      ...base[isLocked ? 'unlock' : 'lock'],
      entityDisplay: display
    };
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
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg 
              ${isLocked ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-green-500'}`}>
            {isLocked ? <Unlock className="w-7 h-7 text-white" /> : <Lock className="w-7 h-7 text-white" />}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{title || config.title}</h3>
            <p className="text-gray-600 mt-1">{description || config.description}</p>
          </div>
        </div>

        {/* Warning Section */}
        <div className={`border-2 rounded-xl p-6 mb-6 
            ${isLocked ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
              ${isLocked ? 'bg-yellow-100' : 'bg-blue-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${isLocked ? 'text-yellow-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h4 className={`font-semibold mb-2 ${isLocked ? 'text-yellow-800' : 'text-blue-800'}`}>
                {isLocked ? 'Unlock Warning' : 'Lock Warning'}
              </h4>
              <p className={`text-sm mb-3 ${isLocked ? 'text-yellow-700' : 'text-blue-700'}`}>
                You are about to {isLocked ? 'unlock' : 'lock'} <span className="font-semibold">{display.name}</span>. This will:
              </p>
              <ul className={`text-sm space-y-1 ml-4 ${isLocked ? 'text-yellow-700' : 'text-blue-700'}`}>
                {(warningItems.length > 0 ? warningItems : config.warningItems).map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Entity Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{display.avatar}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">{display.name}</div>
              <div className="text-sm text-gray-600">{display.subtitle}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
              isLocked
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                : 'bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                {isLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {isLocked ? 'Unlock' : 'Lock'} {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </>
            )}
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

export default LockConfirmationModal;
