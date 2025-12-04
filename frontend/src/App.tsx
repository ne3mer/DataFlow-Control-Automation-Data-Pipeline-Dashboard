import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { JobsPage } from './features/jobs/JobsPage';
import { JobDetailPage } from './features/jobs/JobDetailPage';
import { PipelinesPage } from './features/pipelines/PipelinesPage';
import { PipelineDetailPage } from './features/pipelines/PipelineDetailPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Layout>
                  <JobsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <JobDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipelines"
            element={
              <ProtectedRoute>
                <Layout>
                  <PipelinesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipelines/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PipelineDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
