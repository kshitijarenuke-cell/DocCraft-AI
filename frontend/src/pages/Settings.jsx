import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import {
  Settings as SettingsIcon, User, Key, Sliders, Save,
  Loader2, Eye, EyeOff, Check, Shield, AlertTriangle,
  Lock, Palette, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Calibri', 'Arial', 'Roboto', 'Playfair Display'];

const Section = ({ icon: Icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6"
  >
    <div className="panel-header mb-5">
      <Icon size={15} className="text-indigo-400" />
      <span className="panel-title text-base">{title}</span>
    </div>
    {children}
  </motion.div>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}
    >
      <div
        className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
        style={{ left: checked ? '26px' : '2px' }}
      />
    </button>
  </div>
);

export default function Settings() {
  const { user, updatePreferences, logout } = useAuthStore();
  const [prefs, setPrefs] = useState(user?.preferences || {
    defaultFont: 'Inter', defaultFontSize: 14, defaultAlignment: 'left',
    lineSpacing: 1.6, autoSave: true, autoSaveInterval: 30, theme: 'dark',
  });
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    await updatePreferences(prefs);
    setIsSavingPrefs(false);
    setSavedPrefs(true);
    toast.success('Preferences saved!');
    setTimeout(() => setSavedPrefs(false), 2500);
  };

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name cannot be empty'); return; }
    setIsSavingProfile(true);
    try {
      await api.put('/auth/update-profile', { name: profile.name.trim() });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error('Please fill all password fields'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match'); return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setIsSavingPass(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = prompt('Type DELETE to confirm account deletion:');
    if (confirmed !== 'DELETE') { toast.error('Cancelled'); return; }
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted');
      logout();
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto"
    >
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white mb-1">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account, appearance, and preferences</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              {user?.lastLogin && (
                <p className="text-xs text-slate-600 mt-0.5">
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
            <div className="flex gap-3">
              <input
                value={profile.name}
                onChange={e => setProfile({ name: e.target.value })}
                className="input-field flex-1"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="btn-secondary px-4"
              >
                {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        </Section>

        {/* Appearance / Formatting */}
        <Section icon={Palette} title="Default Formatting">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Font</label>
              <select
                value={prefs.defaultFont}
                onChange={e => setPrefs({ ...prefs, defaultFont: e.target.value })}
                className="input-field text-sm py-2"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Font Size: {prefs.defaultFontSize}px
              </label>
              <input
                type="range" min={10} max={20} step={1}
                value={prefs.defaultFontSize}
                onChange={e => setPrefs({ ...prefs, defaultFontSize: parseInt(e.target.value) })}
                className="w-full mt-2 accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Alignment</label>
              <div className="flex gap-1">
                {['left', 'center', 'right', 'justify'].map(a => (
                  <button key={a}
                    onClick={() => setPrefs({ ...prefs, defaultAlignment: a })}
                    className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${
                      prefs.defaultAlignment === a
                        ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {a.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Line Spacing: {prefs.lineSpacing}×
              </label>
              <input
                type="range" min={1} max={3} step={0.1}
                value={prefs.lineSpacing}
                onChange={e => setPrefs({ ...prefs, lineSpacing: parseFloat(e.target.value) })}
                className="w-full mt-2 accent-indigo-500"
              />
            </div>
          </div>

          <div className="mt-5 pt-4 space-y-3" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
            <Toggle
              checked={prefs.autoSave}
              onChange={v => setPrefs({ ...prefs, autoSave: v })}
              label="Auto-Save"
              description="Automatically save documents while editing"
            />
            {prefs.autoSave && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Auto-save interval: {prefs.autoSaveInterval}s
                </label>
                <input
                  type="range" min={10} max={120} step={10}
                  value={prefs.autoSaveInterval}
                  onChange={e => setPrefs({ ...prefs, autoSaveInterval: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSavePrefs}
            disabled={isSavingPrefs}
            className="btn-primary mt-5 text-sm"
          >
            {isSavingPrefs ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : savedPrefs ? (
              <><Check size={14} /> Saved!</>
            ) : (
              <><Save size={14} /> Save Preferences</>
            )}
          </button>
        </Section>

        {/* Change Password */}
        <Section icon={Lock} title="Change Password">
          <div className="space-y-4">
            {[
              { key: 'current', label: 'Current Password', placeholder: 'Your current password' },
              { key: 'newPass', label: 'New Password', placeholder: 'At least 6 characters' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={showPass[key] ? 'text' : 'password'}
                    value={passwords[key]}
                    onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({ ...showPass, [key]: !showPass[key] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleChangePassword}
              disabled={isSavingPass}
              className="btn-secondary text-sm"
            >
              {isSavingPass ? <><Loader2 size={14} className="animate-spin" /> Changing...</> : <><Lock size={14} /> Change Password</>}
            </button>
          </div>
        </Section>

        {/* API Keys Info */}
        <Section icon={Key} title="API Keys">
          <p className="text-xs text-slate-500 mb-4">
            Configure your API keys in the backend{' '}
            <code className="text-indigo-400">.env</code> file. These are server-side keys for security.
          </p>
          {[
            { label: 'OpenAI API Key', env: 'OPENAI_API_KEY', desc: 'AI content detection, rewriting, and diagram generation', link: 'https://platform.openai.com/api-keys' },
            { label: 'Unsplash Access Key', env: 'UNSPLASH_ACCESS_KEY', desc: 'High-quality image search', link: 'https://unsplash.com/developers' },
            { label: 'Pexels API Key', env: 'PEXELS_API_KEY', desc: 'Alternative image search provider', link: 'https://www.pexels.com/api/' },
          ].map(({ label, env, desc, link }) => (
            <div key={env} className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.07)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{label}</span>
                <a href={link} target="_blank" rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Get key →
                </a>
              </div>
              <p className="text-xs text-slate-500 mb-1">{desc}</p>
              <code className="text-xs text-slate-400 font-mono">{env}</code>
            </div>
          ))}
          <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <p className="text-xs text-slate-500">
              <span className="text-indigo-400 font-medium">Note:</span> The app works without API keys
              using built-in fallbacks (Picsum for images, rule-based AI detection).
            </p>
          </div>
        </Section>

        {/* About */}
        <Section icon={Info} title="About DocCraft AI">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Version', value: '2.0.0' },
              { label: 'Frontend', value: 'React + Vite' },
              { label: 'Backend', value: 'Node.js + Express' },
              { label: 'Database', value: 'MongoDB Atlas' },
              { label: 'Editor', value: 'TipTap v3' },
              { label: 'Export', value: 'DOCX + PDF' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger Zone */}
        <Section icon={AlertTriangle} title="Danger Zone">
          <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-sm font-medium text-red-400 mb-1">Delete Account</p>
            <p className="text-xs text-slate-500 mb-3">
              Permanently delete your account and all documents. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
            >
              Delete My Account
            </button>
          </div>
        </Section>
      </div>
    </motion.div>
  );
}
