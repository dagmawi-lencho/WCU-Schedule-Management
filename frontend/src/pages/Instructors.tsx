import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorsAPI } from '../services/api';
import { Plus, Trash2, User } from 'lucide-react';

const Instructors: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => instructorsAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => instructorsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => instructorsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      fullName: formData.get('fullName'),
      phoneNumber: formData.get('phoneNumber'),
      idNumber: formData.get('idNumber'),
      profession: formData.get('profession'),
      position: formData.get('position'),
      rank: formData.get('rank'),
      maxTeachingLoad: Number(formData.get('maxTeachingLoad')),
      specialization: formData.get('specialization')?.toString().split(',').map(s => s.trim()) || [],
    };
    createMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Instructors</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Register Instructor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors?.map((instructor: any) => {
          const currentLoad = instructor.assignedCourses?.reduce((sum: number, c: any) => sum + (c.creditHour || 0), 0) || 0;
          const loadPercentage = (currentLoad / instructor.maxTeachingLoad) * 100;

          return (
            <div key={instructor._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{instructor.fullName}</h3>
                    <p className="text-sm text-gray-600">{instructor.position}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(instructor._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">ID:</span> {instructor.idNumber}</p>
                <p><span className="font-medium">Profession:</span> {instructor.profession}</p>
                <p><span className="font-medium">Phone:</span> {instructor.phoneNumber}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Workload</span>
                    <span>{currentLoad} / {instructor.maxTeachingLoad} credits</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${loadPercentage > 90 ? 'bg-red-500' : loadPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Courses: {instructor.assignedCourses?.length || 0}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Register Instructor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" type="email" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input name="password" type="password" required className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input name="fullName" type="text" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input name="phoneNumber" type="text" required className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ID Number</label>
                  <input name="idNumber" type="text" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Profession</label>
                  <input name="profession" type="text" required className="w-full px-3 py-2 border rounded-md" placeholder="MSc in Software Engineering" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input name="position" type="text" required className="w-full px-3 py-2 border rounded-md" placeholder="Lecturer" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rank</label>
                  <input name="rank" type="text" className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Teaching Load (credits)</label>
                  <input name="maxTeachingLoad" type="number" required className="w-full px-3 py-2 border rounded-md" defaultValue={12} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization (comma-separated)</label>
                  <input name="specialization" type="text" className="w-full px-3 py-2 border rounded-md" placeholder="major, common" />
                </div>
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

export default Instructors;
