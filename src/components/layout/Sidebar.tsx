import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Settings,
  LogOut,
  Feather,
  Menu,
  X,
  Hash,
  Bookmark,
  List,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import ComposeModal from "@/components/ui-custom/ComposeModal";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Mail, label: "Messages", path: "/messages" },
  { icon: List, label: "Lists", path: "/home" },
  { icon: Bookmark, label: "Bookmarks", path: "/home" },
  { icon: Users, label: "Communities", path: "/home" },
  { icon: Hash, label: "Premium", path: "/home" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    { refetchInterval: 5000, enabled: !!user }
  );

  const isActive = (path: string) => {
    if (path === "/profile" && location.pathname.startsWith("/profile"))
      return true;
    return location.pathname === path;
  };

  const handleNav = (path: string) => {
    if (path === "/profile" && user) {
      navigate(`/profile/${user.unionId}`);
    } else {
      navigate(path);
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-black/80 border border-[#2f3336]"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[275px] h-screen sticky top-0 px-2 py-4 border-r border-[#2f3336]">
        <div className="px-4 mb-6">
          <Link to="/home" className="inline-block">
            <img src="/neomnes-logo.png" alt="Neomnes" className="w-8 h-8" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-full text-xl transition-colors ${
                  active
                    ? "font-bold text-[#e7e9ea]"
                    : "text-[#e7e9ea] hover:bg-[#16181c]"
                }`}
              >
                <div className="relative">
                  <item.icon
                    size={26}
                    strokeWidth={active ? 2.5 : 1.5}
                    fill={active && item.icon === Home ? "currentColor" : "none"}
                  />
                  {item.label === "Notifications" && unreadCount && unreadCount.count > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#1d9bf0] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount.count > 9 ? "9+" : unreadCount.count}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setComposeOpen(true)}
          className="mx-4 mt-4 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-lg py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Feather size={20} />
          <span>Post</span>
        </button>

        {user && (
          <div className="mt-auto px-2">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-full text-[#e7e9ea] hover:bg-[#16181c] transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
            <div className="flex items-center gap-3 px-4 py-3">
              <img
                src={user.avatar || "/avatar-1.jpg"}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">
                  {user.displayName || user.name || "User"}
                </p>
                <p className="text-[#71767b] text-sm truncate">
                  @{user.unionId}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -275 }}
              animate={{ x: 0 }}
              exit={{ x: -275 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 w-[275px] h-screen bg-black z-50 flex flex-col px-2 py-4 border-r border-[#2f3336] lg:hidden"
            >
              <div className="px-4 mb-6">
                <img src="/neomnes-logo.png" alt="Neomnes" className="w-8 h-8" />
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNav(item.path)}
                      className={`flex items-center gap-4 w-full px-4 py-3 rounded-full text-xl transition-colors ${
                        active
                          ? "font-bold text-[#e7e9ea]"
                          : "text-[#e7e9ea] hover:bg-[#16181c]"
                      }`}
                    >
                      <item.icon
                        size={26}
                        strokeWidth={active ? 2.5 : 1.5}
                        fill={active && item.icon === Home ? "currentColor" : "none"}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              {user && (
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-full text-[#e7e9ea] hover:bg-[#16181c] transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-[#2f3336] z-40 flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className="p-2 relative"
            >
              <item.icon
                size={24}
                strokeWidth={active ? 2.5 : 1.5}
                fill={active && item.icon === Home ? "currentColor" : "none"}
                className={active ? "text-[#e7e9ea]" : "text-[#71767b]"}
              />
              {item.label === "Notifications" && unreadCount && unreadCount.count > 0 && (
                <span className="absolute top-0 right-0 bg-[#1d9bf0] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount.count > 9 ? "9+" : unreadCount.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </>
  );
}
