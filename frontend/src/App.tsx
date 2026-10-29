import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ResumesPage from './pages/ResumesPage';
import JDsPage from './pages/JDsPage';
import AnalysesListPage from './pages/AnalysesListPage';
import NewAnalysisPage from './pages/NewAnalysisPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import CandidateComparisonPage from './pages/CandidateComparisonPage';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-zinc-800 border-t-zinc-300 rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/candidate'} replace />;
  }

  return <>{children}</>;
}

function HomeRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-800 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (token && user) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/candidate'} replace />;
  }

  return <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Home & Landing */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes"
            element={
              <ProtectedRoute>
                <ResumesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jds"
            element={
              <ProtectedRoute>
                <JDsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyses"
            element={
              <ProtectedRoute>
                <AnalysesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyses/new"
            element={
              <ProtectedRoute>
                <NewAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyses/:id"
            element={
              <ProtectedRoute>
                <AnalysisDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare/:jdId"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <CandidateComparisonPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
