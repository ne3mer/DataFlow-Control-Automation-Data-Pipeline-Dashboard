import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';

interface PipelineDetail {
  id: number;
  name: string;
  description: string;
  status: string;
  steps: any[];
}

export const PipelineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pipeline, setPipeline] = useState<PipelineDetail | null>(null);

  useEffect(() => {
    if (id) {
      fetchPipeline(id);
    }
  }, [id]);

  const fetchPipeline = async (pipelineId: string) => {
    try {
      const response = await api.get(`/pipelines/${pipelineId}`);
      setPipeline(response.data);
    } catch (error) {
      console.error('Failed to fetch pipeline', error);
    }
  };

  if (!pipeline) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{pipeline.name}</h1>
      <p className="text-gray-600 mb-6">{pipeline.description || 'No description'}</p>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Pipeline Flow</h2>
        <div className="space-y-4">
          {pipeline.steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="bg-gray-100 p-4 rounded border border-gray-300 flex-1">
                <h3 className="font-bold">Step {index + 1}</h3>
                <pre className="text-xs mt-1">{JSON.stringify(step, null, 2)}</pre>
              </div>
              {index < pipeline.steps.length - 1 && (
                <div className="mx-4 text-gray-400">↓</div>
              )}
            </div>
          ))}
          {pipeline.steps.length === 0 && (
            <p className="text-gray-500">No steps defined.</p>
          )}
        </div>
      </div>
    </div>
  );
};
