import React from 'react';
import { PetitionStats } from '../../types/petition';

interface PetitionsTableProps {
  petitions: PetitionStats[];
  onRespond: (petition: PetitionStats) => void;
}

const PetitionsTable: React.FC<PetitionsTableProps> = ({ petitions, onRespond }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium">Petitions Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signatures
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Threshold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {petitions.map((petition) => (
              <tr key={petition.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{petition.title}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      petition.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {petition.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {petition.signature_count}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {petition.signature_threshold}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {petition.status === 'open' &&
                    petition.signature_count >= petition.signature_threshold && (
                      <button
                        onClick={() => onRespond(petition)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Respond
                      </button>
                    )}
                  {petition.status === 'closed' && (
                    <button
                      onClick={() => onRespond(petition)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View Response
                    </button>
                  )}
                  {petition.status === 'open' &&
                    petition.signature_count < petition.signature_threshold && (
                      <span className="text-yellow-600">
                        Needs {petition.signature_threshold - petition.signature_count} more
                        signatures
                      </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetitionsTable;