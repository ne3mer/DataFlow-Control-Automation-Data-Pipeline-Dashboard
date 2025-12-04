import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useWebSocket } from '../../hooks/useWebSocket';

interface JobDetail {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  schedule: string;
  configuration: any;
}

interface JobRun {
  id: number;
  status: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  exit_code: number | null;
  summary: string | null;
}

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [runs, setRuns] = useState<JobRun[]>([]);
  const { messages: logs } = useWebSocket(id ? `/api/v1/ws/jobs/${id}/logs` : '');

  useEffect(() => {
    if (id) {
      fetchJob(id);
      fetchRuns(id);
    }
  }, [id]);

  const fetchJob = async (jobId: string) => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job', error);
    }
  };

  const fetchRuns = async (jobId: string) => {
    try {
      const response = await api.get(`/jobs/${jobId}/runs`);
      setRuns(response.data);
    } catch (error) {
      console.error('Failed to fetch job runs', error);
    }
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{job.name}</h1>
      <p className="text-gray-600 mb-6">{job.description || 'No description'}</p>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Type:</span> {job.type}
          </div>
          <div>
            <span className="font-semibold">Schedule:</span> {job.schedule || 'None'}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {job.status}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Config:</span>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
              {JSON.stringify(job.configuration, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Live Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {logs.length === 0 && <div className="text-gray-500">Waiting for logs...</div>}
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-bold mb-4">Run History</h2>
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Started</th>
              <th className="text-left py-2 px-2">Finished</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Duration</th>
              <th className="text-left py-2 px-2">Exit Code</th>
              <th className="text-left py-2 px-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b">
                <td className="py-2 px-2 text-sm text-gray-700">
                  {run.started_at ? new Date(run.started_at).toLocaleString() : '-'}
                </td>
                <td className="py-2 px-2 text-sm text-gray-700">
                  {run.finished_at ? new Date(run.finished_at).toLocaleString() : '-'}
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      run.exit_code === 0
                        ? 'bg-green-100 text-green-800'
                        : run.exit_code == null
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-sm text-gray-700">
                  {run.duration_ms != null ? `${(run.duration_ms / 1000).toFixed(2)} s` : '-'}
                </td>
                <td className="py-2 px-2 text-sm text-gray-700">
                  {run.exit_code != null ? run.exit_code : '-'}
                </td>
                <td className="py-2 px-2 text-sm text-gray-700 max-w-xs truncate" title={run.summary || ''}>
                  {run.summary || '-'}
                </td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500 text-sm">
                  No runs yet. Trigger this job to see history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
