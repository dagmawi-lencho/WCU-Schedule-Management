import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesAPI, batchesAPI, semestersAPI, roomsAPI } from '../services/api';
import { Plus, Download, AlertCircle } from 'lucide-react';

const Schedules: React.FC = () => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: schedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulesAPI.getAll().then(res => res.data),
  });

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesAPI.getAll().then(res => res.data),
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => schedulesAPI.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowGenerateModal(false);
    },
  });

  const [selectedBatch, setSelectedBatch] = useState('');
  const { data: semesters } = useQuery({
    queryKey: ['semesters', selectedBatch],
    queryFn: () => semestersAPI.getAll(selectedBatch).then(res => res.data),
    enabled: !!selectedBatch,
  });

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      batchId: formData.get('batchId'),
      semesterId: formData.get('semesterId'),
      section: formData.get('section'),
      department: formData.get('department') || undefined,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      morningShift: { start: '08:00', end: '12:00' },
      afternoonShift: { start: '13:00', end: '17:00' },
      periodsPerDay: 2,
    };
    generateMutation.mutate(data);
  };

  const renderScheduleTable = (schedule: any) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const shifts = ['morning', 'afternoon'];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100">Day</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Morning</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Afternoon</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const morningEntries = schedule.entries.filter(
                (e: any) => e.day === day && e.shift === 'morning'
              );
              const afternoonEntries = schedule.entries.filter(
                (e: any) => e.day === day && e.shift === 'afternoon'
              );

              return (
                <tr key={day}>
                  <td className="border border-gray-300 p-2 font-medium">{day}</td>
                  <td className="border border-gray-300 p-2">
                    {morningEntries.map((entry: any, idx: number) => (
                      <div key={idx} className="mb-2 p-2 bg-blue-50 rounded">
                        <div className="font-semibold">{entry.courseCode}</div>
                        <div className="text-sm">{entry.courseName}</div>
                        <div className="text-xs text-gray-600">{entry.instructorName}</div>
                        <div className="text-xs text-gray-500">{entry.roomNumber} | {entry.startTime}-{entry.endTime}</div>
                      </div>
                    ))}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {afternoonEntries.map((entry: any, idx: number) => (
                      <div key={idx} className="mb-2 p-2 bg-green-50 rounded">
                        <div className="font-semibold">{entry.courseCode}</div>
                        <div className="text-sm">{entry.courseName}</div>
                        <div className="text-xs text-gray-600">{entry.instructorName}</div>
                        <div className="text-xs text-gray-500">{entry.roomNumber} | {entry.startTime}-{entry.endTime}</div>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Schedules</h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Generate Schedule
        </button>
      </div>

      {generateMutation.isError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Error generating schedule. Please check your inputs.</span>
        </div>
      )}

      <div className="space-y-6">
        {schedules?.map((schedule: any) => (
          <div key={schedule._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  Batch {schedule.batchId?.batchNumber || 'N/A'} - {schedule.semesterId?.name || 'N/A'} - Section {schedule.section}
                </h2>
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-semibold ${schedule.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {schedule.status}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                {schedule.status === 'draft' && (
                  <button
                    onClick={() => schedulesAPI.publish(schedule._id).then(() => queryClient.invalidateQueries({ queryKey: ['schedules'] }))}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={() => {
                    window.open(`/api/export/schedule/${schedule._id}/pdf`, '_blank');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>
            {renderScheduleTable(schedule)}
          </div>
        ))}
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Generate Schedule</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium mb-1">Section</label>
                <input name="section" type="text" required className="w-full px-3 py-2 border rounded-md" placeholder="A" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department (optional)</label>
                <input name="department" type="text" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
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

export default Schedules;
