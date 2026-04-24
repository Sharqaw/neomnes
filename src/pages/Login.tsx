import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Globe, Terminal } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [glitchText, setGlitchText] = useState("INITIALIZING SESSION...");

  const glitchEffect = () => {
    const texts = [
      "INITIALIZING SESSION...",
      "CONNECTING TO GRID...",
      "AUTHENTICATING NODE...",
      "VERIFYING IDENTITY...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setGlitchText(texts[i % texts.length]);
      i++;
      if (i > 6) clearInterval(interval);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(29,155,240,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(29,155,240,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      {/* Glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1d9bf0]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a855f7]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#71767b] hover:text-[#e7e9ea] transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          العودة للعالم
        </button>

        {/* Card */}
        <div
          className="rounded-2xl border p-8 relative overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.8)",
            borderColor: "#1d9bf044",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1d9bf0] to-transparent" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative"
              style={{
                background: "linear-gradient(135deg, #1d9bf022, #a855f722)",
                border: "1px solid #1d9bf044",
              }}
            >
              <Terminal size={24} className="text-[#1d9bf0]" />
              <div className="absolute inset-0 rounded-2xl bg-[#1d9bf0]/10 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-[#e7e9ea] mb-2">تسجيل الدخول</h1>
            <p className="text-[#71767b] text-sm">ادخل إلى الشبكة العالمية</p>
          </div>

          {/* Terminal-like status */}
          <div className="mb-6 p-3 rounded-lg font-mono text-xs"
            style={{
              background: "#0a0e17",
              border: "1px solid #1d9bf022",
            }}
          >
            <div className="text-[#1d9bf0] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ba7c] animate-pulse" />
              {glitchText}
            </div>
            <div className="text-[#2f3336] mt-1">
              {`> NODE: ${window.location.host}`}
            </div>
            <div className="text-[#2f3336]">
              {`> PROTOCOL: OAuth 2.0`}
            </div>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              glitchEffect();
              setTimeout(() => {
                window.location.href = getOAuthUrl();
              }, 800);
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #1d9bf0, #0a8cd8)",
              color: "#fff",
              boxShadow: "0 0 20px rgba(29,155,240,0.3)",
            }}
          >
            {loading ? (
              <>
                <Sparkles size={18} className="animate-spin" />
                جاري الاتصال...
              </>
            ) : (
              <>
                <Globe size={18} />
                الدخول عبر Kimi
              </>
            )}
          </button>

          <p className="text-[#2f3336] text-xs text-center mt-6 font-mono">
            By signing in, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
