import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, History, Settings, LogOut,
  Zap, ChevronRight, Layout, Menu, X, Bell,
  Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/app/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/templates',  icon: Layout,           label: 'Templates' },
  { to: '/app/history',    icon: History,          label: 'History' },
  { to: '/app/settings',   icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isDark = theme === 'dark';

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications', { params: { unreadOnly: 'true', limit: 1 } });
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: `1px solid var(--border-sm)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>
              DocCraft AI
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>v2.0</p>
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* New Document Button */}
      <div className="px-3 py-3">
        <button
          onClick={() => navigate('/app/templates')}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all group"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <FileText size={15} />
          <span className="flex-1 text-left">New Document</span>
          <ChevronRight size={13} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item text-sm font-medium ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border-sm)' }}>
        {/* Notifications */}
        <button
          className="nav-item w-full text-sm font-medium mb-0.5 relative"
          onClick={() => toast('Notifications coming in next update!', { icon: '🔔' })}
        >
          <Bell size={17} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span
              className="ml-auto px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: '#6366f1', minWidth: '18px', textAlign: 'center' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User card */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 mt-1"
          style={{ background: 'var(--bg-hover)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="nav-item w-full text-sm"
          style={{ color: '#f87171' }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--bg-sidebar)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-sm)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Zap size={14} className="text-white" />
          </div>
          <span
            className="font-display font-bold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            DocCraft AI
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle on mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 h-full z-50 w-72"
              style={{
                background: 'var(--bg-sidebar)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--border-sm)',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
