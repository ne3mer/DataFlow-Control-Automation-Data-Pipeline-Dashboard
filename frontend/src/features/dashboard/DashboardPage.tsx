import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';

interface DashboardSummary {
  total_jobs: number;
  active_pipelines: number;
  todays_runs: number;
  failure_rate: number;
}

interface RunsPerDayPoint {
  date: string;
  total: number;
  failed: number;
}

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_jobs: 0,
    active_pipelines: 0,
    todays_runs: 0,
    failure_rate: 0,
  });

  const [runsPerDay, setRunsPerDay] = useState<RunsPerDayPoint[]>([]);

  const { lastMessage } = useWebSocket('/api/v1/ws/dashboard');

  useEffect(() => {
    if (lastMessage) {
      setSummary(lastMessage);
    }
  }, [lastMessage]);

  useEffect(() => {
    // Initial fetch for summary and runs-per-day metrics
    api.get('/dashboard/summary').then((res) => setSummary(res.data));
    api.get('/dashboard/runs-per-day?days=7').then((res) => setRunsPerDay(res.data));
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

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Runs in the last 7 days</h2>
        <div className="space-y-2">
          {runsPerDay.map((day) => {
            const total = day.total || 0;
            const failed = day.failed || 0;
            const success = Math.max(total - failed, 0);
            const totalWidth = total === 0 ? 0 : 100;
            const failedWidth = total === 0 ? 0 : (failed / total) * 100;
            const successWidth = total === 0 ? 0 : (success / total) * 100;

            return (
              <div key={day.date}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{day.date}</span>
                  <span>
                    {total} runs ({failed} failed)
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded overflow-hidden flex">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${totalWidth}%`, opacity: 0.2 }}
                  />
                  <div
                    className="bg-red-500 h-full -ml-[100%]"
                    style={{ width: `${failedWidth}%`, opacity: 0.6 }}
                  />
                  <div
                    className="bg-emerald-500 h-full -ml-[100%]"
                    style={{ width: `${successWidth}%`, opacity: 0.6 }}
                  />
                </div>
              </div>
            );
          })}
          {runsPerDay.length === 0 && (
            <p className="text-sm text-gray-500">No runs recorded yet.</p>
          )}
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
