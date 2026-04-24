import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

const settingsSections = [
  { id: "account", label: "Your Account", icon: User, description: "Profile info, display name, bio" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Signal alerts, mentions, emails" },
  { id: "security", label: "Security", icon: Shield, description: "Password, 2FA, sessions" },
  { id: "display", label: "Display", icon: Palette, description: "Theme, font size, colors" },
  { id: "language", label: "Language", icon: Globe, description: "Interface language, region" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState("account");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || "");
  const [saved, setSaved] = useState(false);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const utils = trpc.useUtils();

  const handleSave = () => {
    updateProfile.mutate({
      displayName: displayName || undefined,
      bio: bio || undefined,
      location: location || undefined,
      website: website || undefined,
      bannerUrl: bannerUrl || undefined,
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[#71767b] text-sm mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#2f3336] focus:border-[#1d9bf0] text-[#e7e9ea] py-2 outline-none transition-colors"
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-[#71767b] text-sm mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b-2 border-[#2f3336] focus:border-[#1d9bf0] text-[#e7e9ea] py-2 outline-none transition-colors resize-none"
                placeholder="Tell the grid about yourself"
              />
            </div>
            <div>
              <label className="block text-[#71767b] text-sm mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#2f3336] focus:border-[#1d9bf0] text-[#e7e9ea] py-2 outline-none transition-colors"
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="block text-[#71767b] text-sm mb-2">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#2f3336] focus:border-[#1d9bf0] text-[#e7e9ea] py-2 outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-[#71767b] text-sm mb-2">Banner Image URL</label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#2f3336] focus:border-[#1d9bf0] text-[#e7e9ea] py-2 outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-[#e7e9ea] hover:bg-white text-black font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2"
            >
              {updateProfile.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : saved ? (
                <Check size={16} />
              ) : null}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            {[
              { label: "Signal Alerts", desc: "When someone interacts with your signals" },
              { label: "Direct Messages", desc: "New message notifications" },
              { label: "Mentions", desc: "When someone mentions you" },
              { label: "Follows", desc: "When someone starts monitoring you" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#2f3336]">
                <div>
                  <p className="text-[#e7e9ea] font-medium">{item.label}</p>
                  <p className="text-[#71767b] text-sm">{item.desc}</p>
                </div>
                <button className="w-12 h-6 bg-[#1d9bf0] rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            ))}
          </div>
        );

      case "security":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-[#16181c] rounded-xl border border-[#2f3336]">
              <h3 className="font-bold text-[#e7e9ea] mb-2">Password</h3>
              <p className="text-[#71767b] text-sm mb-3">Managed via Kimi OAuth</p>
              <button className="text-[#1d9bf0] text-sm hover:underline">Change password</button>
            </div>
            <div className="p-4 bg-[#16181c] rounded-xl border border-[#2f3336]">
              <h3 className="font-bold text-[#e7e9ea] mb-2">Two-Factor Authentication</h3>
              <p className="text-[#71767b] text-sm mb-3">Add an extra layer of security</p>
              <button className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-2 px-4 rounded-full text-sm transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        );

      case "display":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#2f3336]">
              <div>
                <p className="text-[#e7e9ea] font-medium">Dark Mode</p>
                <p className="text-[#71767b] text-sm">Always on for Neomnes</p>
              </div>
              <span className="text-[#1d9bf0] text-sm font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#2f3336]">
              <div>
                <p className="text-[#e7e9ea] font-medium">Font Size</p>
                <p className="text-[#71767b] text-sm">Adjust text size</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-full bg-[#2f3336] text-sm">Small</button>
                <button className="px-3 py-1 rounded-full bg-[#1d9bf0] text-sm text-white">Medium</button>
                <button className="px-3 py-1 rounded-full bg-[#2f3336] text-sm">Large</button>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-4">
            {["English", "Chinese", "Japanese", "Spanish", "French"].map((lang) => (
              <button
                key={lang}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  lang === "English"
                    ? "border-[#1d9bf0] bg-[#1d9bf0]/10"
                    : "border-[#2f3336] hover:bg-[#16181c]"
                }`}
              >
                <p className="text-[#e7e9ea] font-medium">{lang}</p>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-[#2f3336]">
        <div className="flex items-center gap-4 px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-[#16181c] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-xl text-[#e7e9ea]">Settings</h2>
            <p className="text-[#71767b] text-sm">@{user?.unionId}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left menu */}
        <div className="lg:w-[250px] lg:border-r lg:border-[#2f3336]">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[#2f3336] transition-colors ${
                  activeSection === section.id
                    ? "bg-[#16181c] font-bold"
                    : "hover:bg-[#16181c]"
                }`}
              >
                <Icon size={20} className={activeSection === section.id ? "text-[#1d9bf0]" : "text-[#71767b]"} />
                <div className="text-left flex-1">
                  <p className="text-[#e7e9ea] text-sm">{section.label}</p>
                  <p className="text-[#71767b] text-xs hidden lg:block">{section.description}</p>
                </div>
                <ChevronRight size={16} className="text-[#71767b]" />
              </button>
            );
          })}
        </div>

        {/* Right panel */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-6"
        >
          <h3 className="text-xl font-bold text-[#e7e9ea] mb-6">
            {settingsSections.find((s) => s.id === activeSection)?.label}
          </h3>
          {renderSection()}
        </motion.div>
      </div>
    </Layout>
  );
}
