import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Signal from "@/components/ui-custom/Signal";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "media">("posts");

  const { data: profileUser } = trpc.auth.getUserByUsername.useQuery(
    { username: username || "" },
    { enabled: !!username }
  );

  const { data: postData } = trpc.post.getByUser.useInfiniteQuery(
    { userId: profileUser?.id || 0, limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!profileUser?.id,
    }
  );

  const { data: followCounts } = trpc.follow.getCounts.useQuery(
    { userId: profileUser?.id || 0 },
    { enabled: !!profileUser?.id }
  );

  const { data: isFollowing } = trpc.follow.isFollowing.useQuery(
    { userId: profileUser?.id || 0 },
    { enabled: !!profileUser?.id && !!currentUser }
  );

  const toggleFollow = trpc.follow.toggle.useMutation({
    onSuccess: () => {
      utils.follow.isFollowing.invalidate({ userId: profileUser?.id || 0 });
      utils.follow.getCounts.invalidate({ userId: profileUser?.id || 0 });
    },
  });

  const utils = trpc.useUtils();

  const allPosts = postData?.pages.flatMap((page) => page.posts) ?? [];
  const isOwnProfile = currentUser?.id === profileUser?.id;

  if (!profileUser && username) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#1d9bf0] mb-4" />
          <p className="text-[#71767b]">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[#71767b] text-xl">User not found</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 text-[#1d9bf0] hover:underline"
          >
            Go home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-[#2f3336]">
        <div className="flex items-center gap-4 px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-[#16181c] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-lg text-[#e7e9ea]">
              {profileUser.displayName || profileUser.name || "User"}
            </h2>
            <p className="text-[#71767b] text-sm">
              {allPosts.length} signals
            </p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="h-[150px] bg-[#333] relative overflow-hidden">
        <img
          src={profileUser.bannerUrl || "/banner-1.jpg"}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-16 mb-3">
          <img
            src={profileUser.avatar || "/avatar-1.jpg"}
            alt={profileUser.name || "User"}
            className="w-[133px] h-[133px] rounded-full object-cover border-4 border-black"
          />
          {isOwnProfile ? (
            <button
              onClick={() => navigate("/settings")}
              className="mt-20 px-5 py-2 rounded-full font-bold text-sm border border-[#2f3336] hover:bg-[#16181c] transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => toggleFollow.mutate({ userId: profileUser.id })}
              className={`mt-20 px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                isFollowing?.following
                  ? "bg-transparent border border-[#2f3336] text-white hover:border-[#f4212e] hover:text-[#f4212e]"
                  : "bg-white text-black hover:bg-[#e7e9ea]"
              }`}
            >
              {isFollowing?.following ? "Following" : "Monitor"}
            </button>
          )}
        </div>

        <h1 className="font-bold text-xl text-[#e7e9ea]">
          {profileUser.displayName || profileUser.name || "User"}
        </h1>
        <p className="text-[#71767b] text-sm">@{profileUser.unionId}</p>

        {profileUser.bio && (
          <p className="text-[#e7e9ea] mt-3 text-[15px] leading-normal">
            {profileUser.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-[#71767b] text-sm">
          {profileUser.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {profileUser.location}
            </span>
          )}
          {profileUser.website && (
            <a
              href={profileUser.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#1d9bf0] hover:underline"
            >
              <LinkIcon size={14} />
              {profileUser.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            Initialized{" "}
            {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex gap-6 mt-3">
          <button className="text-sm hover:underline">
            <span className="font-bold text-[#e7e9ea]">
              {followCounts?.following ?? 0}
            </span>{" "}
            <span className="text-[#71767b]">Following</span>
          </button>
          <button className="text-sm hover:underline">
            <span className="font-bold text-[#e7e9ea]">
              {followCounts?.followers ?? 0}
            </span>{" "}
            <span className="text-[#71767b]">Followers</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336] mt-2">
        {(["posts", "replies", "media"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center font-medium capitalize transition-colors relative ${
              activeTab === tab ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#16181c]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="profileTab"
                className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#1d9bf0] rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div>
        {allPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[#71767b] text-lg">No signals yet</p>
          </div>
        ) : (
          allPosts.map((post, index) => (
            <Signal key={post.id} post={post} index={index} />
          ))
        )}
      </div>
    </Layout>
  );
}
