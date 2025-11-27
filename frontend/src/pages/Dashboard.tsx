import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { batchesAPI, coursesAPI, instructorsAPI, schedulesAPI } from '../services/api';
import { GraduationCap, BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: batches } = useQuery({ queryKey: ['batches'], queryFn: () => batchesAPI.getAll().then(res => res.data) });
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => coursesAPI.getAll().then(res => res.data) });
  const { data: instructors } = useQuery({ queryKey: ['instructors'], queryFn: () => instructorsAPI.getAll().then(res => res.data) });
  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: () => schedulesAPI.getAll().then(res => res.data) });

  const stats = [
    { label: 'Batches', value: batches?.length || 0, icon: GraduationCap, color: 'bg-blue-500' },
    { label: 'Courses', value: courses?.length || 0, icon: BookOpen, color: 'bg-green-500' },
    { label: 'Instructors', value: instructors?.length || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Schedules', value: schedules?.length || 0, icon: Calendar, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition text-left">
            <h3 className="font-semibold">Create Batch</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new academic batch</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-left">
            <h3 className="font-semibold">Register Course</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new course</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition text-left">
            <h3 className="font-semibold">Generate Schedule</h3>
            <p className="text-sm text-gray-600 mt-1">Create a new schedule</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



import { useQuery } from '@tanstack/react-query';
import { batchesAPI, coursesAPI, instructorsAPI, schedulesAPI } from '../services/api';
import { GraduationCap, BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: batches } = useQuery({ queryKey: ['batches'], queryFn: () => batchesAPI.getAll().then(res => res.data) });
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => coursesAPI.getAll().then(res => res.data) });
  const { data: instructors } = useQuery({ queryKey: ['instructors'], queryFn: () => instructorsAPI.getAll().then(res => res.data) });
  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: () => schedulesAPI.getAll().then(res => res.data) });

  const stats = [
    { label: 'Batches', value: batches?.length || 0, icon: GraduationCap, color: 'bg-blue-500' },
    { label: 'Courses', value: courses?.length || 0, icon: BookOpen, color: 'bg-green-500' },
    { label: 'Instructors', value: instructors?.length || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Schedules', value: schedules?.length || 0, icon: Calendar, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition text-left">
            <h3 className="font-semibold">Create Batch</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new academic batch</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-left">
            <h3 className="font-semibold">Register Course</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new course</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition text-left">
            <h3 className="font-semibold">Generate Schedule</h3>
            <p className="text-sm text-gray-600 mt-1">Create a new schedule</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;







