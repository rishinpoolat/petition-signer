import React from 'react';
import { Petition } from '../services/petitionService';
import { CalendarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PetitionListProps {
  petitions: Petition[];
  onSignPetition: (petitionId: number) => Promise<void>;
  currentUserId: number;
}

const PetitionList: React.FC<PetitionListProps> = ({
  petitions,
  onSignPetition,
  currentUserId
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (petitions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No petitions available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {petitions.map((petition) => (
        <div
          key={petition.id}
          className="bg-white shadow rounded-lg overflow-hidden"
        >
          <div className="p-6">
            {/* Petition Header */}
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">
                {petition.title}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  petition.status === 'open'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
              </span>
            </div>

            {/* Petition Metadata */}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(petition.created_at)}
              </div>
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {petition.signature_count || 0} signatures
              </div>
              {petition.signature_threshold > 0 && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {petition.signature_threshold} needed
                </div>
              )}
            </div>

            {/* Petition Content */}
            <div className="mt-4 text-gray-600">
              <p>{petition.content}</p>
            </div>

            {/* Response if available */}
            {petition.response && (
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm font-medium text-blue-700">Official Response:</p>
                <p className="mt-2 text-sm text-blue-600">{petition.response}</p>
              </div>
            )}

            {/* Action Button */}
            {petition.status === 'open' && petition.petitioner_id !== currentUserId && (
              <div className="mt-4">
                <button
                  onClick={() => onSignPetition(petition.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign this petition
                </button>
              </div>
            )}

            {/* Show "Your Petition" badge if user is the creator */}
            {petition.petitioner_id === currentUserId && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Your Petition
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PetitionList;