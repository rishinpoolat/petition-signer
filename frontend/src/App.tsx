import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PetitionStats {
  totalPetitions: number;
  activePetitions: number;
  totalSignatures: number;
  recentPetitions: Array<{
    id: number;
    title: string;
  }>;
}

const App: React.FC = () => {
  const [stats, setStats] = useState<PetitionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats from backend...');
        const response = await axios.get('http://localhost:5001/api/stats', {
          timeout: 5000 // 5 seconds timeout
        });
        console.log('Received response:', response.data);
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err);
        if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNREFUSED') {
            setError('Cannot connect to the backend server. Please ensure it is running on port 5001.');
          } else if (err.response) {
            setError(`Server error: ${err.response.status} ${err.response.statusText}`);
          } else if (err.request) {
            setError('No response from server. Please check if the backend is running.');
          } else {
            setError(`Request failed: ${err.message}`);
          }
        } else {
          setError('An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        <p className="text-gray-600">Connecting to SLPP backend</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md p-4 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Connection Error</h2>
        <p className="text-red-600">{error}</p>
        <div className="mt-4 text-sm text-gray-600">
          <p>Troubleshooting steps:</p>
          <ol className="list-decimal ml-4 mt-2">
            <li>Ensure the backend server is running on port 5001</li>
            <li>Check if the backend URL is correct</li>
            <li>Verify there are no CORS issues</li>
          </ol>
        </div>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">No Data Available</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Shangri-La Petition Platform</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Total Petitions</h2>
            <p className="text-3xl text-blue-600">{stats.totalPetitions}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Active Petitions</h2>
            <p className="text-3xl text-green-600">{stats.activePetitions}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Total Signatures</h2>
            <p className="text-3xl text-purple-600">{stats.totalSignatures}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Petitions</h2>
          <ul className="space-y-2">
            {stats.recentPetitions.map(petition => (
              <li 
                key={petition.id}
                className="p-2 hover:bg-gray-50 rounded"
              >
                {petition.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;