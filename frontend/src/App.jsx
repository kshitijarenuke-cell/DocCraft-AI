import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import './store/themeStore'; // initializes theme on import
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Layout     = lazy(() => import('./components/Layout/Layout'));
const Auth       = lazy(() => import('./pages/Auth'));
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const Editor     = lazy(() => import('./pages/Editor'));
const History    = lazy(() => import('./pages/History'));
const Settings   = lazy(() => import('./pages/Settings'));
const Templates  = lazy(() => import('./pages/Templates'));
const NotFound   = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public landing page ── */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <LandingPage />
              </PublicOnlyRoute>
            }
          />

          {/* ── Auth (login / signup) ── */}
          <Route
            path="/auth"
            element={
              <PublicOnlyRoute>
                <Auth />
              </PublicOnlyRoute>
            }
          />

          {/* ── Protected app routes ── */}
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="editor/:id"   element={<Editor />} />
            <Route path="history"      element={<History />} />
            <Route path="settings"     element={<Settings />} />
            <Route path="templates"    element={<Templates />} />
          </Route>

          {/* Legacy /dashboard shortcut → redirect into /app */}
          <Route path="/dashboard"  element={<ProtectedRoute><Navigate to="/app/dashboard" replace /></ProtectedRoute>} />
          <Route path="/editor/:id" element={<ProtectedRoute><Navigate to="/app/editor/:id" replace /></ProtectedRoute>} />
          <Route path="/history"    element={<ProtectedRoute><Navigate to="/app/history" replace /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><Navigate to="/app/settings" replace /></ProtectedRoute>} />
          <Route path="/templates"  element={<ProtectedRoute><Navigate to="/app/templates" replace /></ProtectedRoute>} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
