import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesAPI } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Batches: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => batchesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => batchesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      batchNumber: formData.get('batchNumber'),
      numberOfYears: Number(formData.get('numberOfYears')),
      sections: formData.get('sections')?.toString().split(',').map(s => s.trim()) || ['A'],
      departments: formData.get('departments')?.toString().split(',').map(s => s.trim()) || [],
    };
    createMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Batches</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Batch
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Years</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches?.map((batch: any) => (
              <tr key={batch._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{batch.batchNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{batch.numberOfYears}</td>
                <td className="px-6 py-4 whitespace-nowrap">{batch.sections.join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{batch.departments?.join(', ') || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteMutation.mutate(batch._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Batch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <input
                  name="batchNumber"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 2018"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Years</label>
                <input
                  name="numberOfYears"
                  type="number"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="3 or 4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sections (comma-separated)</label>
                <input
                  name="sections"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="A, B, C"
                  defaultValue="A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Departments (comma-separated, optional)</label>
                <input
                  name="departments"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="CSE, ECE, ME"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesAPI } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Batches: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => batchesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => batchesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      batchNumber: formData.get('batchNumber'),
      numberOfYears: Number(formData.get('numberOfYears')),
      sections: formData.get('sections')?.toString().split(',').map(s => s.trim()) || ['A'],
      departments: formData.get('departments')?.toString().split(',').map(s => s.trim()) || [],
    };
    createMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Batches</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Batch
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Years</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches?.map((batch: any) => (
              <tr key={batch._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{batch.batchNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{batch.numberOfYears}</td>
                <td className="px-6 py-4 whitespace-nowrap">{batch.sections.join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{batch.departments?.join(', ') || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteMutation.mutate(batch._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Batch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <input
                  name="batchNumber"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 2018"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Years</label>
                <input
                  name="numberOfYears"
                  type="number"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="3 or 4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sections (comma-separated)</label>
                <input
                  name="sections"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="A, B, C"
                  defaultValue="A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Departments (comma-separated, optional)</label>
                <input
                  name="departments"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="CSE, ECE, ME"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;







