import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { Post } from "@db/schema";

interface SignalProps {
  post: Post & { author: { id: number; name: string | null; unionId: string; avatar: string | null; displayName: string | null } };
  index?: number;
}

export default function Signal({ post, index = 0 }: SignalProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);
  const [replyCount, setReplyCount] = useState(0);
  const [heartBurst, setHeartBurst] = useState(false);

  const utils = trpc.useUtils();

  const { data: counts } = trpc.interaction.getCounts.useQuery(
    { postId: post.id },
    { enabled: true }
  );

  const { data: userStates } = trpc.interaction.getUserStates.useQuery(
    { postIds: [post.id] },
    { enabled: true }
  );

  const toggleLike = trpc.interaction.toggleLike.useMutation({
    onSuccess: (data) => {
      setLiked(data.liked);
      utils.interaction.getCounts.invalidate({ postId: post.id });
    },
  });

  const toggleBookmark = trpc.interaction.toggleBookmark.useMutation({
    onSuccess: (data) => {
      setBookmarked(data.bookmarked);
    },
  });

  const toggleRepost = trpc.interaction.toggleRepost.useMutation({
    onSuccess: (data) => {
      setReposted(data.reposted);
      utils.interaction.getCounts.invalidate({ postId: post.id });
    },
  });

  // Sync with server data
  useState(() => {
    if (counts) {
      setLikeCount(counts.likes);
      setRepostCount(counts.reposts);
      setReplyCount(counts.replies);
    }
    if (userStates?.[post.id]) {
      setLiked(userStates[post.id].liked);
      setBookmarked(userStates[post.id].bookmarked);
      setReposted(userStates[post.id].reposted);
    }
  });

  const handleLike = () => {
    toggleLike.mutate({ postId: post.id });
    if (!liked) {
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 400);
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex gap-3 px-4 py-3 border-b border-[#2f3336] hover:bg-[#080808] transition-colors cursor-pointer"
    >
      <Link
        to={`/profile/${post.author.unionId}`}
        className="flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={post.author.avatar || "/avatar-1.jpg"}
          alt={post.author.name || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            to={`/profile/${post.author.unionId}`}
            className="font-bold text-[#e7e9ea] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {post.author.displayName || post.author.name || "User"}
          </Link>
          <span className="text-[#71767b] text-sm">
            @{post.author.unionId}
          </span>
          <span className="text-[#71767b] text-sm">·</span>
          <span className="text-[#71767b] text-sm hover:underline">
            {formatTime(post.createdAt)}
          </span>
        </div>

        <p className="text-[15px] text-[#e7e9ea] mt-1 whitespace-pre-wrap leading-normal">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336]">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between mt-3 max-w-md">
          <button className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] group transition-colors">
            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
              <MessageCircle size={18} />
            </div>
            <span className="text-xs">{formatCount(counts?.replies ?? replyCount)}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRepost.mutate({ postId: post.id });
            }}
            className={`flex items-center gap-1 group transition-colors ${
              reposted ? "text-[#00ba7c]" : "text-[#71767b] hover:text-[#00ba7c]"
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
              <Repeat2 size={18} />
            </div>
            <span className="text-xs">{formatCount(counts?.reposts ?? repostCount)}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={`flex items-center gap-1 group transition-colors relative ${
              liked ? "text-[#f4212e]" : "text-[#71767b] hover:text-[#f4212e]"
            }`}
          >
            <motion.div
              className="p-2 rounded-full group-hover:bg-[#f4212e]/10 transition-colors"
              animate={heartBurst ? { scale: [1, 1.4, 1] } : {}}
              transition={{ type: "spring", damping: 10, stiffness: 300 }}
            >
              <Heart
                size={18}
                fill={liked ? "currentColor" : "none"}
              />
            </motion.div>
            {heartBurst && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos((i / 6) * Math.PI * 2) * 20,
                      y: Math.sin((i / 6) * Math.PI * 2) * 20,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-3 top-3 w-1 h-1 rounded-full bg-[#f4212e]"
                  />
                ))}
              </div>
            )}
            <span className="text-xs">{formatCount(counts?.likes ?? likeCount)}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark.mutate({ postId: post.id });
            }}
            className={`flex items-center gap-1 group transition-colors ${
              bookmarked ? "text-[#1d9bf0]" : "text-[#71767b] hover:text-[#1d9bf0]"
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
              <Bookmark
                size={18}
                fill={bookmarked ? "currentColor" : "none"}
              />
            </div>
          </button>

          <button className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] group transition-colors">
            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
              <BarChart3 size={18} />
            </div>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
