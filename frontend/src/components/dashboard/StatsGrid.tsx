import React from 'react';
import type { DashboardStats } from '../../types/dashboard';

interface StatsGridProps {
  stats: DashboardStats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Total Petitions</h3>
        <p className="text-3xl font-bold text-indigo-600">{stats.totalPetitions || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Open Petitions</h3>
        <p className="text-3xl font-bold text-green-600">{stats.openPetitions || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Closed Petitions</h3>
        <p className="text-3xl font-bold text-gray-600">{stats.closedPetitions || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Total Signatures</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.totalSignatures || 0}</p>
      </div>
    </div>
  );
};

export default StatsGrid;