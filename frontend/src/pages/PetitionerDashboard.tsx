import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import petitionService, { Petition } from '../services/petitionService';
import CreatePetitionModal from '../components/CreatePetitionModal';
import PetitionList from '../components/PetitionList';
import { PlusIcon, HomeIcon } from '@heroicons/react/24/outline';

const PetitionerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petitionService.getPetitionsWithSignedStatus();
      setPetitions(data);
    } catch (err: any) {
      console.error('Error in fetchPetitions:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch petitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  const handleCreatePetition = async (title: string, content: string) => {
    try {
      setError(null);
      await petitionService.createPetition({ title, content });
      setCreateModalOpen(false);
      await fetchPetitions(); // Refresh the list
    } catch (err: any) {
      console.error('Error in handleCreatePetition:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create petition');
    }
  };

  const handleSignPetition = async (petitionId: number) => {
    try {
      setError(null);
      await petitionService.signPetition(petitionId);
      await fetchPetitions(); // Refresh the list to update signature count and signed status
    } catch (err: any) {
      console.error('Error in handleSignPetition:', err);
      setError(err.response?.data?.error || err.message || 'Failed to sign petition');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center">Please log in to access the dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Link>
              <h1 className="text-xl font-semibold">Petitioner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Petition
              </button>
              <span className="text-gray-700">Welcome, {user.fullName}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mx-4 my-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={fetchPetitions}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-sm underline">Try Again</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="px-4 py-6 sm:px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500">Loading petitions...</p>
            </div>
          ) : (
            <PetitionList 
              petitions={petitions}
              onSignPetition={handleSignPetition}
              currentUserId={user.id}
            />
          )}
        </div>
      </div>

      {/* Create Petition Modal */}
      <CreatePetitionModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreatePetition}
      />
    </div>
  );
};

export default PetitionerDashboard;