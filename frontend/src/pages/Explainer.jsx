import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// SCENES DEFINITIONS

const SceneHook = () => (
  <div className="text-center">
    <motion.h1
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 tracking-tight"
    >
      AI-generated documents are messy
    </motion.h1>
  </div>
);

const SceneProblemVisual = () => (
  <div className="w-full max-w-3xl">
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay" />
      <div className="flex gap-2 mb-6 relative z-10">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
      </div>
      <div className="font-mono text-sm text-slate-400 space-y-4 relative z-10">
        <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="ml-8 text-xl text-yellow-500/70">INTRODUCTION</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="leading-[3]">
          here is some text <span className="bg-red-500/20 border-b border-red-500 px-1 text-red-300">generatd</span> by ai it has no <span className="bg-red-500/20 border-b border-red-500 px-1 text-red-300">strucutre</span> and spacing is
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="pl-12 mt-6">
          very very very bad.
        </motion.p>
      </div>
    </div>
  </div>
);

const ScenePainText = () => (
  <div className="text-center flex flex-col gap-8 text-5xl md:text-7xl font-bold text-slate-300 tracking-tighter">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>Unstructured.</motion.div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="text-slate-500">Unreadable.</motion.div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0, duration: 0.8 }} className="text-red-400/90">Unprofessional.</motion.div>
  </div>
);

const SceneSolutionIntro = () => (
  <div className="text-center relative">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full"
    />
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-indigo-400 tracking-[0.3em] text-sm font-semibold mb-6 uppercase">The Solution</motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 1 }}
      className="text-6xl md:text-8xl font-black text-white tracking-tight"
    >
      Introducing <br />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-sm">DocCraft AI</span>
    </motion.h2>
  </div>
);

const SceneTransformation = () => (
  <div className="w-full max-w-5xl grid grid-cols-2 gap-8 items-center">
    {/* Messy */}
    <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 h-72 shadow-xl flex flex-col justify-center">
      <div className="font-mono text-sm text-slate-500 space-y-4">
        <p className="text-yellow-600/70 text-lg">PROJECT PLAN</p>
        <p className="pl-4">this is <span className="text-red-400 border-b border-red-500/50">badly</span> formatted.</p>
        <p className="leading-loose mt-8">no clear hierarchy</p>
      </div>
    </motion.div>

    {/* Clean */}
    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="backdrop-blur-2xl bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-8 h-72 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)] flex flex-col justify-center">
      {/* Scanner line */}
      <motion.div
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ delay: 1.5, duration: 2, ease: "easeInOut" }}
        className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_20px_2px_rgba(34,211,238,0.8)] z-10"
      />
      <div className="font-sans text-slate-200 space-y-6 opacity-0 animate-[fadeIn_1s_ease-in-out_2s_forwards]">
        <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
        <h1 className="text-2xl font-bold text-white border-b border-white/10 pb-3">Project Plan</h1>
        <ul className="list-disc pl-5 space-y-3 text-indigo-100 text-sm">
          <li>Perfectly formatted</li>
          <li>Clear structural hierarchy</li>
          <li>Professional typography</li>
        </ul>
      </div>
    </motion.div>
  </div>
);

const FEATURES = [
  { title: "AI Analysis", desc: "Instantly detects structural flaws", icon: "✨" },
  { title: "Smart Formatting", desc: "Applies consistent typography", icon: "📐" },
  { title: "Diagram Generator", desc: "Converts text to visuals", icon: "📊" },
  { title: "Export Ready", desc: "PDF & DOCX with one click", icon: "🚀" }
];
const SceneFeatures = () => (
  <div className="w-full max-w-4xl">
    <div className="grid grid-cols-2 gap-6">
      {FEATURES.map((feat, i) => (
        <motion.div
          key={feat.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.3 + 0.4, duration: 0.8, ease: "easeOut" }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4 hover:bg-white/10 hover:border-indigo-500/50 transition-colors shadow-lg"
        >
          <div className="text-3xl bg-white/5 p-4 rounded-xl border border-white/5">{feat.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 tracking-wide">{feat.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const SceneDemoFlow = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500);
    const t2 = setTimeout(() => setStep(2), 3500);
    const t3 = setTimeout(() => setStep(3), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="w-full max-w-3xl backdrop-blur-2xl bg-[#0a0a0f]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Editor Header */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <div className="w-3 h-3 rounded-full bg-slate-600" />
        </div>
        <div className="flex-1 flex justify-center gap-3">
          <motion.div animate={{ color: step >= 1 ? '#a5b4fc' : '#64748b' }} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"><span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">1</span> Analysis</motion.div>
          <div className="w-4 h-px bg-slate-700 my-auto" />
          <motion.div animate={{ color: step >= 2 ? '#86efac' : '#64748b' }} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"><span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">2</span> Fix</motion.div>
          <div className="w-4 h-px bg-slate-700 my-auto" />
          <motion.div animate={{ color: step >= 3 ? '#c4b5fd' : '#64748b' }} className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"><span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">3</span> Diagram</motion.div>
        </div>
      </div>

      <div className="p-10 h-[350px] relative">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-sm text-slate-500">
              system architecture<br /><br />frontend is react. backend is nodejs.<br />database is postgresql.
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-sm text-slate-500">
              <span className="bg-red-500/20 text-red-300 border-b border-red-500">system architecture</span><br /><br />frontend is react. backend is nodejs.<br /><span className="bg-red-500/20 text-red-300 border-b border-red-500">database is postgresql.</span>
            </motion.div>
          )}
          {step >= 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-sans text-sm text-slate-200">
              <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-2">System Architecture</h1>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong className="text-white">Frontend:</strong> React</li>
                <li><strong className="text-white">Backend:</strong> Node.js</li>
                <li><strong className="text-white">Database:</strong> PostgreSQL</li>
              </ul>

              {step === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="mt-8 p-6 border border-purple-500/30 bg-purple-500/10 rounded-xl flex items-center justify-center shadow-inner">
                  <div className="flex items-center gap-6 text-sm font-semibold text-purple-200">
                    <span className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">React</span>
                    <span className="text-purple-400">↔</span>
                    <span className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">Node.js</span>
                    <span className="text-purple-400">↔</span>
                    <span className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">PostgreSQL</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Cursor Animation */}
        <motion.div
          className="absolute z-50 drop-shadow-lg"
          initial={{ x: 400, y: 300, opacity: 0 }}
          animate={
            step === 0 ? { x: 300, y: 200, opacity: 1 } :
              step === 1 ? { x: 230, y: 15, opacity: 1 } :
                step === 2 ? { x: 340, y: 15, opacity: 1 } :
                  { x: 460, y: 15, opacity: 1 }
          }
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1"><path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L5.5 3.21z" /></svg>
        </motion.div>
      </div>
    </div>
  );
};

const SceneFinalOutput = () => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    className="w-full max-w-4xl backdrop-blur-3xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-[0_0_120px_rgba(99,102,241,0.25)]"
  >
    <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-8">
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Q3 Marketing Strategy</h1>
      <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-widest">Ready to Publish</div>
    </div>
    <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
      <p>DocCraft AI ensures that every document you produce meets the highest standards of professional formatting. Your text is perfectly aligned, structured, and visually compelling.</p>
      <div className="grid grid-cols-2 gap-8 pt-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
          <h3 className="text-indigo-400 font-bold mb-2 text-xl">Phase 1: Analysis</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Deep structural breakdown and semantic grouping to ensure logical flow.</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
          <h3 className="text-cyan-400 font-bold mb-2 text-xl">Phase 2: Execution</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Automated layout engine generates perfect typography and visual harmony.</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const SceneCTA = () => (
  <div className="text-center">
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8"
    >
      Stop Copy-Pasting.<br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Start Crafting.</span>
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 1 }}
      className="text-slate-400 text-2xl mb-12 max-w-2xl mx-auto font-light"
    >
      Join the next generation of professionals building stunning documents with AI.
    </motion.p>
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-10 py-5 bg-white text-black font-bold rounded-full text-lg hover:bg-slate-200 transition-colors shadow-[0_0_50px_rgba(255,255,255,0.4)]"
    >
      Try DocCraft AI Free
    </motion.button>
  </div>
);

// MAIN EXPLAINER COMPONENT

const SCENES = [
  SceneHook, SceneProblemVisual, ScenePainText, SceneSolutionIntro,
  SceneTransformation, SceneFeatures, SceneDemoFlow, SceneFinalOutput, SceneCTA
];

const DURATIONS = [2500, 3500, 3000, 2500, 4500, 3500, 4500, 3500, 999999];

export default function Explainer() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scene < SCENES.length - 1) {
        setScene(s => s + 1);
      }
    }, DURATIONS[scene]);
    return () => clearTimeout(timer);
  }, [scene]);

  const CurrentScene = SCENES[scene];

  return (
    <div className="relative w-screen h-screen bg-[#030305] text-white overflow-hidden flex items-center justify-center font-sans selection:bg-indigo-500/30">
      {/* Cinematic Background Glows */}
      <div className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />

      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          animate={{ width: `${((scene + 1) / SCENES.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Bottom Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-50">
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => setScene(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === scene ? 'w-10 bg-white shadow-[0_0_10px_white]' : 'w-2 bg-white/20 hover:bg-white/50'}`}
            aria-label={`Go to scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Main Scene Container */}
      <div className="w-full h-full flex items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.02 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full h-full flex justify-center items-center absolute inset-0"
          >
            <CurrentScene />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
