import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Link } from 'react-router-dom';

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

interface RecentRun {
  id: number;
  job_name: string;
  status: string;
  duration_ms: number | null;
  started_at: string | null;
  exit_code: number | null;
}

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_jobs: 0,
    active_pipelines: 0,
    todays_runs: 0,
    failure_rate: 0,
  });

  const [runsPerDay, setRunsPerDay] = useState<RunsPerDayPoint[]>([]);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  const { lastMessage } = useWebSocket('/api/v1/ws/dashboard');

  useEffect(() => {
    if (lastMessage) {
      setSummary(lastMessage);
    }
  }, [lastMessage]);

  const fetchData = async () => {
    try {
      const [summaryRes, runsRes, recentRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/runs-per-day?days=7'),
        api.get('/dashboard/recent-runs?limit=10'),
      ]);
      setSummary(summaryRes.data);
      setRunsPerDay(runsRes.data);
      setRecentRuns(recentRes.data);
      setLastUpdateTime(new Date());
      console.log('Dashboard data updated:', {
        summary: summaryRes.data,
        runsPerDay: runsRes.data,
        recentRuns: recentRes.data.length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status: string, exitCode: number | null) => {
    if (status === 'completed' && exitCode === 0) return 'text-green-600 bg-green-50';
    if (status === 'failed' || (exitCode !== null && exitCode !== 0)) return 'text-red-600 bg-red-50';
    if (status === 'running') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status: string, exitCode: number | null) => {
    if (status === 'completed' && exitCode === 0) return '✅';
    if (status === 'failed' || (exitCode !== null && exitCode !== 0)) return '❌';
    if (status === 'running') return '🔄';
    return '⏸️';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            title="Refresh dashboard data"
          >
            🔄 Refresh
          </button>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdateTime.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Jobs</h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-blue-700">{summary.total_jobs}</p>
          <p className="text-xs text-gray-500 mt-2">Active jobs in system</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Active Pipelines</h3>
            <span className="text-3xl">⚡</span>
          </div>
          <p className="text-4xl font-bold text-purple-700">{summary.active_pipelines}</p>
          <p className="text-xs text-gray-500 mt-2">Currently running</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Today's Runs</h3>
            <span className="text-3xl">🚀</span>
          </div>
          <p className="text-4xl font-bold text-green-700">{summary.todays_runs}</p>
          <p className="text-xs text-gray-500 mt-2">Executions today</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border border-red-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Failure Rate</h3>
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-4xl font-bold text-red-600">{summary.failure_rate}%</p>
          <p className="text-xs text-gray-500 mt-2">
            {summary.failure_rate < 5 ? 'Excellent!' : summary.failure_rate < 10 ? 'Good' : 'Needs attention'}
          </p>
        </div>
      </div>

      {/* Runs Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📈 Runs in the last 7 days</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Success vs Failed</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Success
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Failed
              </span>
            </div>
          </div>
        </div>
        {runsPerDay.length > 0 ? (
          <div className="space-y-4">
            {runsPerDay.map((day, idx) => {
              const total = day.total || 0;
              const failed = day.failed || 0;
              const success = Math.max(total - failed, 0);
              const maxRuns = Math.max(...runsPerDay.map(d => d.total || 0), 1);
              const barWidth = total === 0 ? 0 : Math.max((total / maxRuns) * 100, 5); // Min 5% for visibility
              const failedWidth = total === 0 ? 0 : (failed / total) * 100;
              const successWidth = total === 0 ? 0 : (success / total) * 100;

              const dateObj = new Date(day.date + 'T00:00:00'); // Ensure proper date parsing
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dateObj.getDate();
              const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

              return (
                <div key={day.date || idx} className="group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-700 w-24">
                        {dayName}, {monthName} {dayNum}
                      </span>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="font-medium">{success}</span>
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-50">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                          <span className="font-medium">{failed}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{total} total</span>
                  </div>
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex relative shadow-inner border border-gray-200">
                    {total > 0 ? (
                      <>
                        <div
                          className="bg-emerald-500 h-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${barWidth * (successWidth / 100)}%` }}
                          title={`${success} successful runs`}
                        >
                          {successWidth > 15 && (
                            <span className="text-xs font-semibold text-white">{success}</span>
                          )}
                        </div>
                        <div
                          className="bg-red-500 h-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${barWidth * (failedWidth / 100)}%` }}
                          title={`${failed} failed runs`}
                        >
                          {failedWidth > 15 && (
                            <span className="text-xs font-semibold text-white">{failed}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-400 italic">No runs on this day</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No runs recorded yet</p>
            <p className="text-sm">Start running jobs to see statistics here!</p>
            <button
              onClick={() => window.location.href = '/jobs'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Go to Jobs →
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🕐 Recent Activity</h2>
          <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </Link>
        </div>
        {recentRuns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{run.job_name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(run.status, run.exit_code)}`}>
                        {getStatusIcon(run.status, run.exit_code)} {run.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {run.duration_ms != null ? `${(run.duration_ms / 1000).toFixed(2)}s` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatTimeAgo(run.started_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">📋</p>
            <p>No recent activity. Jobs will appear here once they run.</p>
          </div>
        )}
      </div>
    </div>
  );
};
