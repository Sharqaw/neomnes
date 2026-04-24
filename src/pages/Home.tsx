import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Signal from "@/components/ui-custom/Signal";
import ComposeModal from "@/components/ui-custom/ComposeModal";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@db/schema";

export default function Home() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const navigate = useNavigate();
  const [feedType, setFeedType] = useState<"for-you" | "following">("for-you");
  const [composeOpen, setComposeOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const feedQuery = trpc.post.getFeed.useInfiniteQuery(
    { type: feedType, limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!user,
    }
  );

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (feedQuery.isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && feedQuery.hasNextPage) {
          feedQuery.fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [feedQuery.isFetchingNextPage, feedQuery.hasNextPage, feedQuery.fetchNextPage]
  );

  const allPosts = feedQuery.data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <Layout>
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-[#2f3336]">
        <div className="flex items-center">
          <button
            onClick={() => setFeedType("for-you")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              feedType === "for-you" ? "text-[#e7e9ea]" : "text-[#71767b]"
            }`}
          >
            For You
            {feedType === "for-you" && (
              <motion.div
                layoutId="feedTab"
                className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setFeedType("following")}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              feedType === "following" ? "text-[#e7e9ea]" : "text-[#71767b]"
            }`}
          >
            Following
            {feedType === "following" && (
              <motion.div
                layoutId="feedTab"
                className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full"
              />
            )}
          </button>
        </div>
      </div>

      {/* Compose box */}
      {user && (
        <div
          onClick={() => setComposeOpen(true)}
          className="flex gap-3 px-4 py-3 border-b border-[#2f3336] cursor-pointer hover:bg-[#080808] transition-colors"
        >
          <img
            src={user.avatar || "/avatar-1.jpg"}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-[#71767b] text-lg py-2">What's happening?</p>
            <div className="flex justify-end">
              <button className="bg-[#1d9bf0]/50 text-white/50 px-5 py-2 rounded-full font-bold text-sm cursor-not-allowed">
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="min-h-[200px]">
        {feedQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#1d9bf0]" />
          </div>
        ) : allPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <Star size={48} className="text-[#1d9bf0] mb-4" />
            <h2 className="text-2xl font-bold text-[#e7e9ea] mb-2">
              {feedType === "following" ? "No signals yet" : "Welcome to Neomnes"}
            </h2>
            <p className="text-[#71767b] max-w-md">
              {feedType === "following"
                ? "Follow more operators to see their signals here."
                : "This is your intelligence feed. Create your first signal to get started."}
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="mt-4 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-6 py-2 rounded-full transition-colors"
            >
              Explore
            </button>
          </div>
        ) : (
          allPosts.map((post: Post & { author: any }, index: number) => (
            <div
              key={post.id}
              ref={index === allPosts.length - 1 ? lastPostRef : undefined}
            >
              <Signal post={post} index={index} />
            </div>
          ))
        )}

        {feedQuery.isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-[#1d9bf0]" />
          </div>
        )}
      </div>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </Layout>
  );
}
