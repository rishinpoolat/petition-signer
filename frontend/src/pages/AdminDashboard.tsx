import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface PetitionStats {
  id: string;
  title: string;
  content: string;
  status: 'open' | 'closed';
  signature_count: number;
  signature_threshold: number;
  created_at: string;
  response?: string;
}

interface DashboardStats {
  totalPetitions: number;
  openPetitions: number;
  closedPetitions: number;
  totalSignatures: number;
  petitions: PetitionStats[];
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(0);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState<PetitionStats | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  // Clear update message after 5 seconds
  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => {
        setUpdateMessage('');
        setUpdateStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/petition-stats');
      setStats(response.data);
      if (response.data.petitions && response.data.petitions.length > 0) {
        setThreshold(response.data.petitions[0].signature_threshold);
      }
      setError('');
    } catch (error) {
      console.error('Fetch stats error:', error);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThreshold = async () => {
    try {
      setIsUpdating(true);
      setError('');
      setUpdateMessage('');
      
      if (threshold < 0) {
        throw new Error('Threshold must be a positive number');
      }

      await api.put('/admin/threshold', { threshold });
      
      setUpdateStatus('success');
      setUpdateMessage('Signature threshold updated successfully');
      
      await fetchStats();
    } catch (error) {
      console.error('Update threshold error:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to update threshold');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRespond = (petition: PetitionStats) => {
    setSelectedPetition(petition);
    setResponse(petition.response || '');
  };

  const handleSubmitResponse = async () => {
    if (!selectedPetition || !response.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post(`/admin/petitions/${selectedPetition.id}/respond`, { response });
      setUpdateStatus('success');
      setUpdateMessage('Response submitted successfully');
      setSelectedPetition(null);
      setResponse('');
      await fetchStats();
    } catch (error) {
      console.error('Submit response error:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {updateMessage && (
          <div
            className={`mb-4 p-3 rounded ${
              updateStatus === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {updateMessage}
          </div>
        )}

        {/* Signature Threshold Management */}
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
                onChange={(e) => setThreshold(Math.max(0, parseInt(e.target.value) || 0))}
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
                onClick={handleUpdateThreshold}
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

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total Petitions</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats?.totalPetitions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Open Petitions</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.openPetitions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Closed Petitions</h3>
            <p className="text-3xl font-bold text-gray-600">{stats?.closedPetitions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total Signatures</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalSignatures || 0}</p>
          </div>
        </div>

        {/* Petitions Table */}
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
                {stats?.petitions.map((petition) => (
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
                            onClick={() => handleRespond(petition)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Respond
                          </button>
                        )}
                      {petition.status === 'closed' && (
                        <button
                          onClick={() => handleRespond(petition)}
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
      </main>

      
      {/* Response Modal */}
      {selectedPetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                {selectedPetition.status === 'open' ? 'Respond to Petition' : 'View Petition Response'}: {selectedPetition.title}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Petition Content
                </label>
                <div className="bg-gray-50 p-4 rounded text-sm">
                  {selectedPetition.content}
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
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={selectedPetition.status === 'closed'}
                  className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    selectedPetition.status === 'closed' ? 'bg-gray-50' : ''
                  }`}
                  placeholder={selectedPetition.status === 'open' ? "Enter the parliamentary response..." : ""}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPetition(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {selectedPetition.status === 'closed' ? 'Close' : 'Cancel'}
                </button>
                {selectedPetition.status === 'open' && (
                  <button
                    onClick={handleSubmitResponse}
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
      )}
    </div>
  );
};
export default AdminDashboard;