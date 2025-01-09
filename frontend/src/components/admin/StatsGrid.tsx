import React from 'react';

interface StatsGridProps {
  totalPetitions: number;
  openPetitions: number;
  closedPetitions: number;
  totalSignatures: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  totalPetitions,
  openPetitions,
  closedPetitions,
  totalSignatures
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Total Petitions</h3>
        <p className="text-3xl font-bold text-indigo-600">{totalPetitions}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Open Petitions</h3>
        <p className="text-3xl font-bold text-green-600">{openPetitions}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Closed Petitions</h3>
        <p className="text-3xl font-bold text-gray-600">{closedPetitions}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Total Signatures</h3>
        <p className="text-3xl font-bold text-blue-600">{totalSignatures}</p>
      </div>
    </div>
  );
};

export default StatsGrid;