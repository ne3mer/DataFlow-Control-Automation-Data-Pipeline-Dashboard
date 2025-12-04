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
  metrics?: {
    title?: string;
    url?: string;
    links_count?: number;
    images_count?: number;
    links?: string[];
    images?: string[];
    first_paragraph?: string;
    meta_description?: string;
  };
  logs?: string;
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
      console.log('Fetched runs:', response.data); // Debug log
      if (response.data && response.data.length > 0) {
        console.log('First run metrics:', response.data[0].metrics); // Debug log
      }
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

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Live Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i}>{typeof log === 'string' ? log : JSON.stringify(log)}</div>
          ))}
          {logs.length === 0 && <div className="text-gray-500">Waiting for logs...</div>}
        </div>
      </div>

      {/* Scraped Data Display - Show for scraper jobs with completed runs */}
      {job.type === 'scraper' && runs.length > 0 && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Scraped Data (Latest Run)</h2>
          {!runs[0].metrics || Object.keys(runs[0].metrics).length === 0 ? (
            <div className="text-gray-500 text-sm">
              <p>⚠️ No scraped data available. This might be because:</p>
              <ul className="list-disc list-inside mt-2">
                <li>The job was run before the scraper was updated</li>
                <li>Please run the job again to see scraped data</li>
              </ul>
              <button
                onClick={() => {
                  if (id) {
                    api.post(`/jobs/${id}/run`).then(() => {
                      setTimeout(() => {
                        fetchRuns(id);
                        fetchJob(id);
                      }, 2000);
                    });
                  }
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                🔄 Run Job Again
              </button>
            </div>
          ) : (
            <>
          {runs[0].metrics.title && (
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {runs[0].metrics.title}
              </h3>
              {runs[0].metrics.url && (
                <a 
                  href={runs[0].metrics.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🔗 {runs[0].metrics.url}
                </a>
              )}
            </div>
          )}
          
          {runs[0].metrics.meta_description && (
            <div className="mb-4">
              <p className="text-gray-600 text-sm">{runs[0].metrics.meta_description}</p>
            </div>
          )}
          
          {runs[0].metrics.first_paragraph && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">First Paragraph:</h4>
              <p className="text-gray-700 text-sm">{runs[0].metrics.first_paragraph}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {runs[0].metrics.links_count !== undefined && (
              <div className="bg-blue-50 p-3 rounded">
                <span className="font-semibold">🔗 Links Found: </span>
                <span className="text-blue-600">{runs[0].metrics.links_count}</span>
              </div>
            )}
            {runs[0].metrics.images_count !== undefined && (
              <div className="bg-green-50 p-3 rounded">
                <span className="font-semibold">🖼️ Images Found: </span>
                <span className="text-green-600">{runs[0].metrics.images_count}</span>
              </div>
            )}
          </div>
          
          {runs[0].metrics.links && runs[0].metrics.links.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Sample Links:</h4>
              <div className="max-h-40 overflow-y-auto">
                {runs[0].metrics.links.map((link, idx) => {
                  const base = runs[0].metrics?.url || '';
                  let href = link;
                  try {
                    href = new URL(link, base).toString();
                  } catch {
                    href = link;
                  }
                  return (
                    <div key={idx} className="text-sm mb-1">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {link}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {runs[0].metrics.images && runs[0].metrics.images.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Sample Images:</h4>
              <div className="grid grid-cols-3 gap-2">
                {runs[0].metrics.images.map((img, idx) => {
                  const base = runs[0].metrics?.url || '';
                  let imgUrl = img;
                  try {
                    imgUrl = new URL(img, base).toString();
                  } catch {
                    imgUrl = img;
                  }
                  return (
                    <div key={idx} className="border rounded overflow-hidden">
                      <img 
                        src={imgUrl} 
                        alt={`Scraped image ${idx + 1}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}

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
