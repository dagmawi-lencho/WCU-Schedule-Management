import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { schedulesAPI, instructorsAPI } from '../services/api';
import { Calendar, BookOpen, Clock } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Find instructor by userId
  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => instructorsAPI.getAll().then(res => res.data),
  });

  const instructor = instructors?.find((inst: any) => inst.userId?._id === user?.id || inst.userId?.email === user?.email);

  const { data: schedule } = useQuery({
    queryKey: ['instructor-schedule', instructor?._id],
    queryFn: () => schedulesAPI.getInstructorSchedule(instructor?._id || '').then(res => res.data),
    enabled: !!instructor?._id,
  });

  const { data: workload } = useQuery({
    queryKey: ['instructor-workload', instructor?._id],
    queryFn: () => instructorsAPI.getWorkload(instructor?._id || '').then(res => res.data),
    enabled: !!instructor?._id,
  });

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Instructor profile not found.</p>
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const scheduleByDay = days.reduce((acc: any, day) => {
    acc[day] = schedule?.filter((entry: any) => entry.day === day) || [];
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Assigned Courses</p>
              <p className="text-2xl font-bold">{workload?.courses?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Current Load</p>
              <p className="text-2xl font-bold">{workload?.currentLoad || 0} credits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Max Load</p>
              <p className="text-2xl font-bold">{workload?.maxLoad || 0} credits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">My Timetable</h2>
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
                const daySchedule = scheduleByDay[day] || [];
                const morning = daySchedule.filter((e: any) => e.shift === 'morning');
                const afternoon = daySchedule.filter((e: any) => e.shift === 'afternoon');

                return (
                  <tr key={day}>
                    <td className="border border-gray-300 p-2 font-medium">{day}</td>
                    <td className="border border-gray-300 p-2">
                      {morning.map((entry: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 bg-blue-50 rounded">
                          <div className="font-semibold">{entry.courseCode}</div>
                          <div className="text-sm">{entry.courseName}</div>
                          <div className="text-xs text-gray-500">{entry.roomNumber} | {entry.startTime}-{entry.endTime}</div>
                        </div>
                      ))}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {afternoon.map((entry: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 bg-green-50 rounded">
                          <div className="font-semibold">{entry.courseCode}</div>
                          <div className="text-sm">{entry.courseName}</div>
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
      </div>
    </div>
  );
};

export default InstructorDashboard;



import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { schedulesAPI, instructorsAPI } from '../services/api';
import { Calendar, BookOpen, Clock } from 'lucide-react';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Find instructor by userId
  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => instructorsAPI.getAll().then(res => res.data),
  });

  const instructor = instructors?.find((inst: any) => inst.userId?._id === user?.id || inst.userId?.email === user?.email);

  const { data: schedule } = useQuery({
    queryKey: ['instructor-schedule', instructor?._id],
    queryFn: () => schedulesAPI.getInstructorSchedule(instructor?._id || '').then(res => res.data),
    enabled: !!instructor?._id,
  });

  const { data: workload } = useQuery({
    queryKey: ['instructor-workload', instructor?._id],
    queryFn: () => instructorsAPI.getWorkload(instructor?._id || '').then(res => res.data),
    enabled: !!instructor?._id,
  });

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Instructor profile not found.</p>
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const scheduleByDay = days.reduce((acc: any, day) => {
    acc[day] = schedule?.filter((entry: any) => entry.day === day) || [];
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Assigned Courses</p>
              <p className="text-2xl font-bold">{workload?.courses?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Current Load</p>
              <p className="text-2xl font-bold">{workload?.currentLoad || 0} credits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Max Load</p>
              <p className="text-2xl font-bold">{workload?.maxLoad || 0} credits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">My Timetable</h2>
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
                const daySchedule = scheduleByDay[day] || [];
                const morning = daySchedule.filter((e: any) => e.shift === 'morning');
                const afternoon = daySchedule.filter((e: any) => e.shift === 'afternoon');

                return (
                  <tr key={day}>
                    <td className="border border-gray-300 p-2 font-medium">{day}</td>
                    <td className="border border-gray-300 p-2">
                      {morning.map((entry: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 bg-blue-50 rounded">
                          <div className="font-semibold">{entry.courseCode}</div>
                          <div className="text-sm">{entry.courseName}</div>
                          <div className="text-xs text-gray-500">{entry.roomNumber} | {entry.startTime}-{entry.endTime}</div>
                        </div>
                      ))}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {afternoon.map((entry: any, idx: number) => (
                        <div key={idx} className="mb-2 p-2 bg-green-50 rounded">
                          <div className="font-semibold">{entry.courseCode}</div>
                          <div className="text-sm">{entry.courseName}</div>
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
      </div>
    </div>
  );
};

export default InstructorDashboard;







