import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  '🔍 AI-Powered Content Detection',
  '✍️  Intelligent Rewriting & Restructuring',
  '📄 Professional DOCX Export',
  '🖼️  Smart Image Search & Insert',
  '📊 Diagram & Flowchart Generation',
  '📝 Rich Text Editor with Formatting',
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, isLoading, error, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    clearError();
  }, [mode]);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    let result;
    if (mode === 'login') {
      result = await login(form.email, form.password);
    } else {
      if (!form.name.trim()) { toast.error('Please enter your name'); return; }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
      result = await signup(form.name, form.email, form.password);
    }

    if (result.success) {
      toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created! 🎉');
      navigate('/app/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #070d1a 0%, #0f172a 50%, #1a0533 100%)' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-xl">DocCraft AI</h1>
              <p className="text-xs text-slate-500">Intelligent Document Automation</p>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <div className="badge-primary mb-6 w-fit">
            <Sparkles size={12} />
            AI-Powered Platform
          </div>
          <h2 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            Transform Raw Content Into
            <span className="gradient-text block">Professional Documents</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Detect AI-generated content, rewrite for clarity, auto-structure with headings, and export beautiful DOCX files — all in one intelligent platform.
          </p>

          {/* Features list */}
          <div className="space-y-3">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}>
                <CheckCircle size={15} className="text-indigo-400 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-slate-600">
          © 2024 DocCraft AI. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">DocCraft AI</span>
          </div>

          {/* Card */}
          <div className="glass-card p-8">
            {/* Mode Toggle */}
            <div className="flex rounded-xl p-1 mb-8" style={{ background: 'rgba(15,23,42,0.6)' }}>
              {['login', 'signup'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                    mode === m ? 'text-white shadow-glow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={mode === m ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-white">
                {mode === 'login' ? 'Welcome back' : 'Get started today'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {mode === 'login'
                  ? 'Sign in to access your documents'
                  : 'Create your free DocCraft AI account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    value={form.password}
                    onChange={handleChange}
                    className="input-field pr-12"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl p-3 text-sm text-red-300 animate-fade-in"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center mt-2 py-3 text-sm"
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
                ) : (
                  <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div className="mt-5 p-3 rounded-xl text-center"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <p className="text-xs text-slate-500">
                <span className="text-indigo-400 font-medium">Demo:</span> Use any email & password (6+ chars) to create an account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
