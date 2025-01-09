import React from 'react';
import { PetitionStats } from '../../types/petition';

interface ResponseModalProps {
  petition: PetitionStats;
  response: string;
  isSubmitting: boolean;
  onResponseChange: (response: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const ResponseModal: React.FC<ResponseModalProps> = ({
  petition,
  response,
  isSubmitting,
  onResponseChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {petition.status === 'open' ? 'Respond to Petition' : 'View Petition Response'}: {petition.title}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Petition Content
            </label>
            <div className="bg-gray-50 p-4 rounded text-sm">
              {petition.content}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
              Parliamentary Response
            </label>
            <textarea
              id="response"
              rows={6}
              value={response}
              onChange={(e) => onResponseChange(e.target.value)}
              disabled={petition.status === 'closed'}
              className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                petition.status === 'closed' ? 'bg-gray-50' : ''
              }`}
              placeholder={petition.status === 'open' ? "Enter the parliamentary response..." : ""}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {petition.status === 'closed' ? 'Close' : 'Cancel'}
            </button>
            {petition.status === 'open' && (
              <button
                onClick={onSubmit}
                disabled={isSubmitting || !response.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isSubmitting || !response.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;