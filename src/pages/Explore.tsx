import { useState } from "react";
import { useSearchParams } from "react-router";
import { Search, TrendingUp, Hash, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Signal from "@/components/ui-custom/Signal";
import { trpc } from "@/providers/trpc";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<"trending" | "search">("trending");

  const { data: trends } = trpc.search.trends.useQuery({ limit: 10 });
  const { data: searchResults, isLoading: searchLoading } = trpc.search.posts.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      setActiveTab("search");
    }
  };

  return (
    <Layout>
      {/* Search header */}
      <div className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-[#2f3336]">
        <form onSubmit={handleSearch} className="px-4 py-3">
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
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336]">
        <button
          onClick={() => setActiveTab("trending")}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === "trending" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#16181c]"
          }`}
        >
          Trending
          {activeTab === "trending" && (
            <motion.div
              layoutId="exploreTab"
              className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === "search" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#16181c]"
          }`}
        >
          Results
          {activeTab === "search" && (
            <motion.div
              layoutId="exploreTab"
              className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full"
            />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "trending" ? (
        <div>
          <div className="px-4 py-4">
            <h2 className="text-xl font-bold text-[#e7e9ea] mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#1d9bf0]" />
              Trending Intel
            </h2>
          </div>
          {trends?.map((trend, i) => (
            <button
              key={trend.id}
              onClick={() => {
                setSearchQuery(trend.topic);
                setSearchParams({ q: trend.topic });
                setActiveTab("search");
              }}
              className="w-full text-left px-4 py-4 border-b border-[#2f3336] hover:bg-[#16181c] transition-colors flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-1">
                <Hash size={16} className="text-[#71767b]" />
              </div>
              <div className="flex-1">
                <p className="text-[#71767b] text-xs">{trend.category}</p>
                <p className="font-bold text-[#e7e9ea] text-[15px]">{trend.topic}</p>
                <p className="text-[#71767b] text-sm">{trend.postCount.toLocaleString()} posts</p>
              </div>
              <div className="text-[#71767b] text-xs">{i + 1}</div>
            </button>
          ))}
          {(!trends || trends.length === 0) && (
            <div className="px-4 py-8 text-center text-[#71767b]">
              No trending topics available.
            </div>
          )}
        </div>
      ) : (
        <div>
          {searchLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#1d9bf0]" />
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((post, index) => (
              <Signal key={post.id} post={post} index={index} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <Search size={48} className="text-[#2f3336] mb-4" />
              <h2 className="text-xl font-bold text-[#e7e9ea] mb-2">
                {searchQuery ? "No results found" : "Search the Grid"}
              </h2>
              <p className="text-[#71767b]">
                {searchQuery
                  ? `No signals match "${searchQuery}"`
                  : "Enter a query to find signals, operators, and topics."}
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
