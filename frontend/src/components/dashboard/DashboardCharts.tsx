import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import type { DashboardStats, ChartData } from '../../types/dashboard';
import WordCloudChart from './WordCloudChart';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardChartsProps {
  stats: DashboardStats;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  // Prepare data for signature trends chart
  const signaturesTrendData = useMemo((): ChartData => {
    const sortedPetitions = [...stats.petitions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return {
      labels: sortedPetitions.map(petition => 
        new Date(petition.created_at).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Signatures Over Time',
          data: sortedPetitions.map(petition => petition.signature_count),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          fill: true
        },
      ],
    };
  }, [stats.petitions]);

  // Prepare data for petition status distribution
  const statusDistributionData = useMemo((): ChartData => {
    return {
      labels: ['Open', 'Closed'],
      datasets: [
        {
          label: 'Petition Status Distribution',
          data: [stats.openPetitions, stats.closedPetitions],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [stats.openPetitions, stats.closedPetitions]);

  // Prepare data for threshold achievement
  const thresholdComparisonData = useMemo((): ChartData => {
    const thresholdMet = stats.petitions.filter(
      p => p.signature_count >= p.signature_threshold
    ).length;
    const belowThreshold = stats.totalPetitions - thresholdMet;

    return {
      labels: ['Below Threshold', 'Met Threshold'],
      datasets: [
        {
          label: 'Threshold Achievement',
          data: [belowThreshold, thresholdMet],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [stats.petitions, stats.totalPetitions]);

  return (
    <div className="space-y-6 mb-6">
      {/* Word Cloud Chart - Added at the top */}
      <WordCloudChart petitions={stats.petitions} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signatures Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Signatures Trend</h3>
          <div className="h-64">
            <Line
              data={signaturesTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Petition Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Petition Status Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={statusDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Threshold Achievement Chart */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-medium mb-4">Threshold Achievement</h3>
          <div className="h-64">
            <Bar
              data={thresholdComparisonData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;