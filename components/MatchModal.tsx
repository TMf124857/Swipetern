import React from 'react';

interface MatchModalProps {
  isOpen: boolean;
  studentName: string;
  employerCompany: string;
  opportunityTitle: string;
  onClose: () => void;
  onGoToChat: () => void;
  onGoToDepartureHub: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  isOpen,
  studentName,
  employerCompany,
  opportunityTitle,
  onClose,
  onGoToChat,
  onGoToDepartureHub,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-fuchsia-500/30 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative transform scale-100 transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 hover:bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-slate-200 transition focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus:outline-hidden"
          style={{ minHeight: '36px', minWidth: '36px' }}
          aria-label="Close match overlay"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        {/* Celebration Header */}
        <div className="h-20 w-20 bg-gradient-to-tr from-fuchsia-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce shadow-lg shadow-fuchsia-500/20">
          <i className="fa-solid fa-fire" />
        </div>

        <h3 className="text-3xl font-black text-slate-100 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 leading-snug">
          Vibe Check Passed!
        </h3>
        <p className="text-slate-400 text-sm mt-2 font-medium leading-relaxed">
          Mutual match confirmed. You have established a double opt-in corridor connection!
        </p>

        {/* Match details */}
        <div className="my-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-left space-y-2 font-semibold text-slate-300">
          <div>
            <span className="font-bold text-slate-500">Student:</span>{' '}
            <span className="font-medium text-slate-200">{studentName}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500">Employer:</span>{' '}
            <span className="font-medium text-slate-200">{employerCompany}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500">Opportunity:</span>{' '}
            <span className="font-medium text-fuchsia-400">{opportunityTitle}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoToChat}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:from-fuchsia-600 hover:to-indigo-700 text-white font-black py-3.5 rounded-2xl shadow-lg transition transform hover:scale-102 focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus:outline-hidden"
            style={{ minHeight: '44px' }}
          >
            Start Chatting Straight to DM
          </button>

          <button
            onClick={onGoToDepartureHub}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black py-3.5 rounded-2xl transition focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus:outline-hidden"
            style={{ minHeight: '44px' }}
          >
            Go to Departure Hub
          </button>
        </div>
      </div>
    </div>
  );
};
