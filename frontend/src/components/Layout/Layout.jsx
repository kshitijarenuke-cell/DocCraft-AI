import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '../../store/themeStore';

export default function Layout() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)', transition: 'background 0.25s ease' }}>
      <Sidebar />
      {/* Main content — offset for sidebar on desktop, top bar on mobile */}
      <main className="flex-1 lg:ml-[260px] min-h-screen" style={{ background: 'var(--bg-page)' }}>
        {/* Mobile top padding to clear the fixed top bar */}
        <div className="lg:hidden h-[56px]" />
        <div className="p-4 sm:p-6 lg:p-8 max-w-full">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? 'rgba(30,41,59,0.97)' : 'rgba(255,255,255,0.97)',
            color: isDark ? '#f1f5f9' : '#0f172a',
            border: `1px solid ${isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.1)'}`,
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '10px 14px',
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(15,23,42,0.1)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: isDark ? '#f1f5f9' : '#ffffff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: isDark ? '#f1f5f9' : '#ffffff' } },
        }}
      />
    </div>
  );
}

