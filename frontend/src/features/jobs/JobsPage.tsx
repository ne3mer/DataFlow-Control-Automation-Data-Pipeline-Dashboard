import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface Job {
  id: number;
  name: string;
  type: string;
  status: string;
  last_run_at: string | null;
  next_run_at: string | null;
}

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState<{ name: string; type: string; schedule: string; url: string }>({
    name: '',
    type: 'custom',
    schedule: '',
    url: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runJob = async (id: number) => {
    try {
      await api.post(`/jobs/${id}/run`);
      fetchJobs(); // Refresh list
    } catch (error) {
      console.error('Failed to run job', error);
    }
  };

  const cancelJob = async (id: number) => {
    try {
      await api.post(`/jobs/${id}/cancel`);
      fetchJobs(); // Refresh list
    } catch (error) {
      console.error('Failed to cancel job', error);
    }
  };

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newJob.name,
        type: newJob.type,
        schedule: newJob.schedule === '' ? null : newJob.schedule,
        configuration: newJob.type === 'scraper' ? { url: newJob.url } : {}
      };
      await api.post('/jobs/', payload);
      setIsModalOpen(false);
      setNewJob({ name: '', type: 'custom', schedule: '', url: '' });
      fetchJobs();
    } catch (error) {
      console.error('Failed to create job', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Job
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-md shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Create New Job</h2>
            <form onSubmit={createJob}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                <select
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="custom">Custom Script</option>
                  <option value="scraper">Scraper</option>
                  <option value="pdf_processor">PDF Processor</option>
                  <option value="api_sync">API Sync</option>
                </select>
              </div>

              {newJob.type === 'scraper' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Target URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newJob.url}
                    onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Schedule (Cron)</label>
                <input
                  type="text"
                  placeholder="* * * * *"
                  value={newJob.schedule}
                  onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2 px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{job.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{job.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                    job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {job.last_run_at ? new Date(job.last_run_at).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {job.next_run_at ? new Date(job.next_run_at).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {job.status === 'running' ? (
                    <button
                      onClick={() => cancelJob(job.id)}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={() => runJob(job.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Run
                    </button>
                  )}
                  <Link to={`/jobs/${job.id}`} className="text-gray-600 hover:text-gray-900">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
