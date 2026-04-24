import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px] bg-black border border-[#2f3336] rounded-2xl p-8"
      >
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-[#16181c] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8">
          <img src="/neomnes-logo.png" alt="Neomnes" className="w-10 h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#e7e9ea]">Initialize Session</h1>
          <p className="text-[#71767b] mt-2">Connect to the grid</p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            window.location.href = getOAuthUrl();
          }}
          disabled={loading}
          className="w-full bg-[#e7e9ea] hover:bg-white text-black font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Sparkles size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          Sign in with Kimi
        </button>

        <p className="text-[#71767b] text-xs text-center mt-6">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
