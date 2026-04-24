import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { motion } from "framer-motion";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: trends } = trpc.search.trends.useQuery({ limit: 5 });
  const { data: suggestions } = trpc.follow.getSuggestions.useQuery(
    { limit: 3 },
    { enabled: true }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="sticky top-0 z-10 bg-black pb-2">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71767b]"
          />
          <input
            type="text"
            placeholder="Search the Grid"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#202327] text-[#e7e9ea] placeholder-[#71767b] rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#1d9bf0] transition-all"
          />
        </div>
      </form>

      {/* Trending */}
      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] overflow-hidden">
        <h2 className="text-xl font-bold px-4 pt-4 pb-2">Trending Intel</h2>
        {trends?.map((trend) => (
          <button
            key={trend.id}
            onClick={() => navigate(`/explore?q=${encodeURIComponent(trend.topic)}`)}
            className="w-full text-left px-4 py-3 hover:bg-[#1e2028] transition-colors"
          >
            <p className="text-[#71767b] text-xs">{trend.category}</p>
            <p className="font-bold text-sm text-[#e7e9ea]">{trend.topic}</p>
            <p className="text-[#71767b] text-xs">{trend.postCount.toLocaleString()} posts</p>
          </button>
        ))}
        {(!trends || trends.length === 0) && (
          <div className="px-4 py-4 text-[#71767b] text-sm">
            No trending topics yet.
          </div>
        )}
        <button
          onClick={() => navigate("/explore")}
          className="w-full text-left px-4 py-3 text-[#1d9bf0] text-sm hover:bg-[#1e2028] transition-colors"
        >
          Show more
        </button>
      </div>

      {/* Who to follow */}
      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] overflow-hidden">
        <h2 className="text-xl font-bold px-4 pt-4 pb-2">Suggested Operators</h2>
        {suggestions?.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#1e2028] transition-colors"
          >
            <Link to={`/profile/${user.unionId}`} className="flex-shrink-0">
              <img
                src={user.avatar || "/avatar-1.jpg"}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                to={`/profile/${user.unionId}`}
                className="font-bold text-sm text-[#e7e9ea] truncate hover:underline block"
              >
                {user.displayName || user.name || "User"}
              </Link>
              <p className="text-[#71767b] text-sm truncate">@{user.unionId}</p>
            </div>
            <FollowButton userId={user.id} />
          </motion.div>
        ))}
        {(!suggestions || suggestions.length === 0) && (
          <div className="px-4 py-4 text-[#71767b] text-sm">
            No suggestions available.
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#71767b] px-2">
        <span>Terms</span>
        <span>Privacy</span>
        <span>Cookies</span>
        <span>Accessibility</span>
        <span>Ads</span>
        <span>Careers</span>
        <span>Brand</span>
        <span>Developers</span>
        <span>Settings</span>
        <span>2026 Neomnes Inc.</span>
      </div>
    </div>
  );
}

function FollowButton({ userId }: { userId: number }) {
  const utils = trpc.useUtils();
  const { data } = trpc.follow.isFollowing.useQuery({ userId });
  const mutation = trpc.follow.toggle.useMutation({
    onSuccess: () => {
      utils.follow.isFollowing.invalidate({ userId });
      utils.follow.getSuggestions.invalidate();
    },
  });

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        mutation.mutate({ userId });
      }}
      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
        data?.following
          ? "bg-transparent border border-[#2f3336] text-white hover:border-[#f4212e] hover:text-[#f4212e]"
          : "bg-white text-black hover:bg-[#e7e9ea]"
      }`}
    >
      {data?.following ? "Following" : "Follow"}
    </button>
  );
}
