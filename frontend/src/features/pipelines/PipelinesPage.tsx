import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface Pipeline {
  id: number;
  name: string;
  status: string;
  steps: any[];
}

export const PipelinesPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      const response = await api.get('/pipelines/');
      setPipelines(response.data);
    } catch (error) {
      console.error('Failed to fetch pipelines', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runPipeline = async (id: number) => {
    try {
      await api.post(`/pipelines/${id}/run`);
      fetchPipelines();
    } catch (error) {
      console.error('Failed to run pipeline', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pipelines</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Pipeline
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pipelines.map((pipeline) => (
              <tr key={pipeline.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pipeline.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    pipeline.status === 'completed' ? 'bg-green-100 text-green-800' :
                    pipeline.status === 'failed' ? 'bg-red-100 text-red-800' :
                    pipeline.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pipeline.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {pipeline.steps.length} steps
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => runPipeline(pipeline.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Run
                  </button>
                  <Link to={`/pipelines/${pipeline.id}`} className="text-gray-600 hover:text-gray-900">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {pipelines.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No pipelines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
