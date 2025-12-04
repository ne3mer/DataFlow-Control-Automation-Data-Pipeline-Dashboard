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

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const { messages: logs } = useWebSocket(id ? `/api/v1/ws/jobs/${id}/logs` : '');

  useEffect(() => {
    if (id) {
      fetchJob(id);
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
    </div>
  );
};
