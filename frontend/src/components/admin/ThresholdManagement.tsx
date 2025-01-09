import React from 'react';

interface ThresholdManagementProps {
  threshold: number;
  isUpdating: boolean;
  onThresholdChange: (value: number) => void;
  onUpdateThreshold: () => void;
}

const ThresholdManagement: React.FC<ThresholdManagementProps> = ({
  threshold,
  isUpdating,
  onThresholdChange,
  onUpdateThreshold
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Signature Threshold Management</h3>
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-xs">
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
            Required Signatures
          </label>
          <input
            type="number"
            id="threshold"
            value={threshold}
            onChange={(e) => onThresholdChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="0"
            placeholder="Enter signature threshold"
          />
          <p className="mt-1 text-sm text-gray-500">
            This threshold will apply to all open petitions
          </p>
        </div>
        <div className="flex items-end">
          <button
            onClick={onUpdateThreshold}
            disabled={isUpdating}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              isUpdating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isUpdating ? 'Updating...' : 'Update Threshold'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThresholdManagement;