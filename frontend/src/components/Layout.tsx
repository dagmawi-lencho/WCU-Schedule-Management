import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, BookOpen, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-blue-900 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">🎓 Class Schedule</h1>
          <p className="text-blue-200 text-sm mt-1">{user?.fullName}</p>
          <p className="text-blue-300 text-xs mt-1 capitalize">{user?.role}</p>
        </div>

        <nav className="mt-8">
          <Link
            to="/dashboard"
            className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
          >
            <LayoutDashboard className="mr-3" size={20} />
            Dashboard
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/batches"
                className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
              >
                <GraduationCap className="mr-3" size={20} />
                Batches
              </Link>
              <Link
                to="/courses"
                className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
              >
                <BookOpen className="mr-3" size={20} />
                Courses
              </Link>
              <Link
                to="/instructors"
                className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
              >
                <Users className="mr-3" size={20} />
                Instructors
              </Link>
            </>
          )}

          <Link
            to="/schedules"
            className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
          >
            <Calendar className="mr-3" size={20} />
            Schedules
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-blue-100 hover:bg-blue-800 transition rounded"
          >
            <LogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;



import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, BookOpen, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-blue-900 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">🎓 Class Schedule</h1>
          <p className="text-blue-200 text-sm mt-1">{user?.fullName}</p>
          <p className="text-blue-300 text-xs mt-1 capitalize">{user?.role}</p>
        </div>

        <nav className="mt-8">
          <Link
            to="/dashboard"
            className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
          >
            <LayoutDashboard className="mr-3" size={20} />
            Dashboard
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/batches"
                className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
              >
                <GraduationCap className="mr-3" size={20} />
                Batches
              </Link>
              <Link
                to="/courses"
                className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
              >
                <BookOpen className="mr-3" size={20} />
                Courses
              </Link>
              <Link
                to="/instructors"
                className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
              >
                <Users className="mr-3" size={20} />
                Instructors
              </Link>
            </>
          )}

          <Link
            to="/schedules"
            className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 transition"
          >
            <Calendar className="mr-3" size={20} />
            Schedules
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-blue-100 hover:bg-blue-800 transition rounded"
          >
            <LogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;







