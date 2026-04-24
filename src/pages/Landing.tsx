import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function ParticleField() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#1d9bf0]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, -20, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Floating text fragments */}
      {["DATA", "NODE", "LINK", "FEED", "NEO", "GRID", "SYNC", "CORE", "FLOW", "PULSE", "ECHO", "WAVE"].map((text, i) => (
        <motion.div
          key={text}
          className="absolute text-[#1d9bf0]/20 font-mono text-sm font-bold whitespace-nowrap select-none"
          style={{
            left: `${(i * 8) % 100}%`,
            top: `${(i * 7 + 10) % 90}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 8 + i * 0.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.div>
      ))}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/home");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Sparkles size={32} className="animate-pulse text-[#1d9bf0]" />
      </div>
    );
  }

  const marqueeText = "DATA · NODE · LINK · FEED · USER · VOID · NEO · GRID · MEM · BYTE · ECHO · FLOW · PULSE · SYNC · CORE · WAVE · FLUX · ";

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left: Animated particle field */}
      <div className="flex-1 min-h-[40vh] lg:min-h-screen relative bg-gradient-to-br from-black via-[#0a0a0f] to-black">
        <ParticleField />
        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-[#1d9bf0]/5 blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent lg:hidden" />
      </div>

      {/* Right: UI Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-8 lg:py-0 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={showUI ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[380px]"
        >
          <img
            src="/neomnes-logo.png"
            alt="Neomnes"
            className="w-12 h-12 mb-8"
          />
          <h1 className="text-4xl lg:text-5xl font-bold text-[#e7e9ea] mb-4 tracking-tight leading-tight">
            The world is shifting.
          </h1>
          <p className="text-[#71767b] text-lg mb-8">
            Join the grid before it locks you out.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#e7e9ea] hover:bg-white text-black font-bold py-3 px-6 rounded-full transition-colors text-base"
            >
              Initialize Session
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-transparent border border-[#2f3336] hover:border-[#e7e9ea] text-[#1d9bf0] font-bold py-3 px-6 rounded-full transition-colors text-base"
            >
              Re-establish Link
            </button>
          </div>

          <p className="text-[#71767b] text-sm mt-6">
            By joining, you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>

        {/* Marquee footer */}
        <div className="mt-12 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-content text-[#2f3336] text-xs uppercase tracking-[0.1em] font-mono">
              {marqueeText}
              {marqueeText}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#71767b]">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Accessibility</span>
          <span>Developers</span>
          <span>Brand</span>
          <span>Settings</span>
          <span>2026 Neomnes Inc.</span>
        </div>
      </motion.div>
    </div>
  );
}
