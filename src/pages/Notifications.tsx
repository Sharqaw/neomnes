import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Heart, Repeat2, UserPlus, MessageCircle, Check, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");

  const { data, isLoading } = trpc.notification.getAll.useQuery(
    { limit: 20 },
    { enabled: !!user, refetchInterval: 5000 }
  );

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.getAll.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  const utils = trpc.useUtils();

  const notifications = data?.notifications ?? [];
  const filtered = activeTab === "mentions"
    ? notifications.filter((n) => n.type === "reply" || n.type === "mention")
    : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={20} className="text-[#f4212e]" fill="#f4212e" />;
      case "repost":
        return <Repeat2 size={20} className="text-[#00ba7c]" />;
      case "follow":
        return <UserPlus size={20} className="text-[#1d9bf0]" />;
      case "reply":
      case "mention":
        return <MessageCircle size={20} className="text-[#1d9bf0]" />;
      default:
        return <Bell size={20} className="text-[#1d9bf0]" />;
    }
  };

  const getMessage = (notification: typeof notifications[0]) => {
    const actorName = notification.actor?.displayName || notification.actor?.name || "Someone";
    switch (notification.type) {
      case "like":
        return `${actorName} endorsed your signal`;
      case "repost":
        return `${actorName} amplified your signal`;
      case "follow":
        return `${actorName} started monitoring you`;
      case "reply":
        return `${actorName} replied to your signal`;
      case "mention":
        return `${actorName} mentioned you`;
      default:
        return "New notification";
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-[#2f3336]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-[#16181c] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-bold text-xl text-[#e7e9ea]">Notifications</h2>
          </div>
          <button
            onClick={() => markAllRead.mutate()}
            className="p-2 rounded-full hover:bg-[#16181c] transition-colors text-[#1d9bf0]"
            title="Mark all read"
          >
            <Check size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336]">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === "all" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#16181c]"
          }`}
        >
          All
          {activeTab === "all" && (
            <motion.div
              layoutId="notifTab"
              className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("mentions")}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === "mentions" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#16181c]"
          }`}
        >
          Mentions
          {activeTab === "mentions" && (
            <motion.div
              layoutId="notifTab"
              className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full"
            />
          )}
        </button>
      </div>

      {/* Notifications list */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#1d9bf0]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <Bell size={48} className="text-[#2f3336] mb-4" />
            <h2 className="text-xl font-bold text-[#e7e9ea] mb-2">
              No notifications yet
            </h2>
            <p className="text-[#71767b]">
              When someone interacts with your signals, you'll see it here.
            </p>
          </div>
        ) : (
          filtered.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-start gap-3 px-4 py-4 border-b border-[#2f3336] hover:bg-[#080808] transition-colors cursor-pointer ${
                !notification.isRead ? "bg-[#1d9bf0]/5" : ""
              }`}
              onClick={() => {
                if (notification.postId) {
                  navigate(`/home`);
                } else if (notification.actor) {
                  navigate(`/profile/${notification.actor.unionId}`);
                }
              }}
            >
              <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                {notification.actor && (
                  <Link
                    to={`/profile/${notification.actor.unionId}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={notification.actor.avatar || "/avatar-1.jpg"}
                      alt={notification.actor.name || "User"}
                      className="w-8 h-8 rounded-full object-cover mb-2"
                    />
                  </Link>
                )}
                <p className="text-[#e7e9ea] text-[15px]">
                  {getMessage(notification)}
                </p>
                {notification.post?.content && (
                  <p className="text-[#71767b] text-sm mt-1 line-clamp-2">
                    {notification.post.content}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Layout>
  );
}
