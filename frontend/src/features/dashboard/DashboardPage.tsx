import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface DashboardSummary {
  total_jobs: number;
  active_pipelines: number;
  todays_runs: number;
  failure_rate: number;
}

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_jobs: 0,
    active_pipelines: 0,
    todays_runs: 0,
    failure_rate: 0,
  });

  useEffect(() => {
    // Fetch dashboard data
    // For now, we'll just simulate it or fetch real data if endpoints exist
    // api.get('/dashboard/summary').then(res => setSummary(res.data));
    
    // Mock data
    setSummary({
      total_jobs: 12,
      active_pipelines: 3,
      todays_runs: 45,
      failure_rate: 2.5,
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.total_jobs}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Pipelines</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.active_pipelines}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Today's Runs</h3>
          <p className="text-3xl font-bold text-gray-800">{summary.todays_runs}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm font-medium">Failure Rate</h3>
          <p className="text-3xl font-bold text-red-500">{summary.failure_rate}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Job Name</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Duration</th>
              <th className="text-left py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Scrape Marca</td>
              <td className="py-2 text-green-600">Success</td>
              <td className="py-2">1.2s</td>
              <td className="py-2">2 mins ago</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Process PDF</td>
              <td className="py-2 text-red-600">Failed</td>
              <td className="py-2">0.5s</td>
              <td className="py-2">15 mins ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
