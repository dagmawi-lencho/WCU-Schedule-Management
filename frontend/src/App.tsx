import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Courses from './pages/Courses';
import Instructors from './pages/Instructors';
import Schedules from './pages/Schedules';
import InstructorDashboard from './pages/InstructorDashboard';
import Layout from './components/Layout';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin, isInstructor } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route
          path="dashboard"
          element={
            isAdmin ? (
              <PrivateRoute requireAdmin>
                <Dashboard />
              </PrivateRoute>
            ) : (
              <PrivateRoute>
                <InstructorDashboard />
              </PrivateRoute>
            )
          }
        />
        <Route
          path="batches"
          element={
            <PrivateRoute requireAdmin>
              <Batches />
            </PrivateRoute>
          }
        />
        <Route
          path="courses"
          element={
            <PrivateRoute requireAdmin>
              <Courses />
            </PrivateRoute>
          }
        />
        <Route
          path="instructors"
          element={
            <PrivateRoute requireAdmin>
              <Instructors />
            </PrivateRoute>
          }
        />
        <Route
          path="schedules"
          element={
            <PrivateRoute>
              <Schedules />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

