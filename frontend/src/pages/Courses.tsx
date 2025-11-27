import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI, batchesAPI, semestersAPI, instructorsAPI } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Courses: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.getAll().then(res => res.data),
  });

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesAPI.getAll().then(res => res.data),
  });

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => instructorsAPI.getAll().then(res => res.data),
  });

  const [selectedBatch, setSelectedBatch] = useState('');
  const { data: semesters } = useQuery({
    queryKey: ['semesters', selectedBatch],
    queryFn: () => semestersAPI.getAll(selectedBatch).then(res => res.data),
    enabled: !!selectedBatch,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => coursesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      courseName: formData.get('courseName'),
      courseCode: formData.get('courseCode'),
      creditHour: Number(formData.get('creditHour')),
      majorOrCommon: formData.get('majorOrCommon'),
      semesterId: formData.get('semesterId'),
      batchId: formData.get('batchId'),
      hasLab: formData.get('hasLab') === 'on',
      instructorId: formData.get('instructorId'),
      department: formData.get('department') || undefined,
    };
    createMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Register Course
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Has Lab</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses?.map((course: any) => (
              <tr key={course._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{course.courseCode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.courseName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.creditHour}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{course.majorOrCommon}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.hasLab ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.instructorId?.fullName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteMutation.mutate(course._id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Register Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course Name</label>
                  <input name="courseName" type="text" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course Code</label>
                  <input name="courseCode" type="text" required className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Credit Hour</label>
                  <input name="creditHour" type="number" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select name="majorOrCommon" required className="w-full px-3 py-2 border rounded-md">
                    <option value="major">Major</option>
                    <option value="common">Common</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Batch</label>
                  <select
                    name="batchId"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                    <option value="">Select Batch</option>
                    {batches?.map((batch: any) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <select name="semesterId" required className="w-full px-3 py-2 border rounded-md" disabled={!selectedBatch}>
                    <option value="">Select Semester</option>
                    {semesters?.map((semester: any) => (
                      <option key={semester._id} value={semester._id}>
                        {semester.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor</label>
                <select name="instructorId" required className="w-full px-3 py-2 border rounded-md">
                  <option value="">Select Instructor</option>
                  {instructors?.map((instructor: any) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department (optional)</label>
                <input name="department" type="text" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input name="hasLab" type="checkbox" className="rounded" />
                  <span>Has Lab</span>
                </label>
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

export default Courses;



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI, batchesAPI, semestersAPI, instructorsAPI } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Courses: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.getAll().then(res => res.data),
  });

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesAPI.getAll().then(res => res.data),
  });

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => instructorsAPI.getAll().then(res => res.data),
  });

  const [selectedBatch, setSelectedBatch] = useState('');
  const { data: semesters } = useQuery({
    queryKey: ['semesters', selectedBatch],
    queryFn: () => semestersAPI.getAll(selectedBatch).then(res => res.data),
    enabled: !!selectedBatch,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => coursesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      courseName: formData.get('courseName'),
      courseCode: formData.get('courseCode'),
      creditHour: Number(formData.get('creditHour')),
      majorOrCommon: formData.get('majorOrCommon'),
      semesterId: formData.get('semesterId'),
      batchId: formData.get('batchId'),
      hasLab: formData.get('hasLab') === 'on',
      instructorId: formData.get('instructorId'),
      department: formData.get('department') || undefined,
    };
    createMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Register Course
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Has Lab</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses?.map((course: any) => (
              <tr key={course._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{course.courseCode}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.courseName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.creditHour}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{course.majorOrCommon}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.hasLab ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.instructorId?.fullName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteMutation.mutate(course._id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Register Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course Name</label>
                  <input name="courseName" type="text" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course Code</label>
                  <input name="courseCode" type="text" required className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Credit Hour</label>
                  <input name="creditHour" type="number" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select name="majorOrCommon" required className="w-full px-3 py-2 border rounded-md">
                    <option value="major">Major</option>
                    <option value="common">Common</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Batch</label>
                  <select
                    name="batchId"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                    <option value="">Select Batch</option>
                    {batches?.map((batch: any) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <select name="semesterId" required className="w-full px-3 py-2 border rounded-md" disabled={!selectedBatch}>
                    <option value="">Select Semester</option>
                    {semesters?.map((semester: any) => (
                      <option key={semester._id} value={semester._id}>
                        {semester.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor</label>
                <select name="instructorId" required className="w-full px-3 py-2 border rounded-md">
                  <option value="">Select Instructor</option>
                  {instructors?.map((instructor: any) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department (optional)</label>
                <input name="department" type="text" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input name="hasLab" type="checkbox" className="rounded" />
                  <span>Has Lab</span>
                </label>
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

export default Courses;







