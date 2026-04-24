import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Rocket, LogIn, Globe, ChevronRight, Sparkles } from "lucide-react";
import type { Region } from "./RegionMarkers";

export default function GameUI({
  selectedRegion,
  avatarState,
  onEnterRegion,
  onLogin,
}: {
  selectedRegion: Region | null;
  avatarState: "idle" | "moving" | "arrived";
  onEnterRegion: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/neomnes-logo.png" alt="Neomnes" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight text-[#e7e9ea]">NEOMNES</span>
        </div>
        <div className="flex items-center gap-2 text-[#71767b] text-sm">
          <Globe size={14} />
          <span>Select your grid node</span>
        </div>
      </div>

      {/* Region info panel - bottom left */}
      <AnimatePresence mode="wait">
        {selectedRegion && (
          <motion.div
            key={selectedRegion.id}
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="absolute bottom-8 left-8 pointer-events-auto"
          >
            <div
              className="rounded-2xl border p-5 backdrop-blur-xl max-w-[320px]"
              style={{
                background: "rgba(0,0,0,0.7)",
                borderColor: `${selectedRegion.color}44`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} style={{ color: selectedRegion.color }} />
                <h2 className="font-bold text-xl text-[#e7e9ea]">{selectedRegion.nameAr}</h2>
              </div>
              <p className="text-[#71767b] text-sm mb-4">{selectedRegion.name}</p>

              {/* Cities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedRegion.cities.map((city) => (
                  <span
                    key={city}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${selectedRegion.color}18`,
                      color: selectedRegion.color,
                      border: `1px solid ${selectedRegion.color}33`,
                    }}
                  >
                    {city}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {avatarState === "idle" && (
                  <button
                    onClick={onEnterRegion}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: selectedRegion.color,
                      color: "#000",
                    }}
                  >
                    <Rocket size={16} />
                    ادخل المنطقة
                  </button>
                )}
                {avatarState === "moving" && (
                  <div
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm"
                    style={{
                      background: `${selectedRegion.color}33`,
                      color: selectedRegion.color,
                      border: `1px solid ${selectedRegion.color}55`,
                    }}
                  >
                    <Sparkles size={16} className="animate-pulse" />
                    جاري التنقل...
                  </div>
                )}
                {avatarState === "arrived" && (
                  <button
                    onClick={onLogin}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm bg-[#e7e9ea] hover:bg-white text-black transition-all hover:scale-105 active:scale-95"
                  >
                    <LogIn size={16} />
                    تسجيل الدخول
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      {!selectedRegion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#71767b] text-sm flex items-center gap-2"
        >
          <MapPin size={14} className="animate-bounce" />
          اختر منطقتك على الكرة الأرضية للدخول
        </motion.div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-8 right-8 text-[#2f3336] text-xs font-mono">
        <div>GRID NODE: ACTIVE</div>
        <div className="text-[#1d9bf0]">SYNC: ONLINE</div>
      </div>

      <div className="absolute bottom-8 right-8 text-[#2f3336] text-xs font-mono text-right">
        <div>NEOMNES v1.0</div>
        <div className="text-[#71767b]">2026</div>
      </div>
    </div>
  );
}
