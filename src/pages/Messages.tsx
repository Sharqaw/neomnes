import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Send, Loader2, MessageSquare } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");

  const { data: conversations, isLoading } = trpc.message.getConversations.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 5000 }
  );

  const { data: threadData } = trpc.message.getThread.useQuery(
    { userId: selectedUser || 0, limit: 50 },
    { enabled: !!selectedUser && !!user, refetchInterval: 3000 }
  );

  const utils = trpc.useUtils();

  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      utils.message.getThread.invalidate({ userId: selectedUser || 0 });
      utils.message.getConversations.invalidate();
      setMessageContent("");
    },
  });

  const handleSend = () => {
    if (!messageContent.trim() || !selectedUser) return;
    sendMessage.mutate({
      recipientId: selectedUser,
      content: messageContent.trim(),
    });
  };

  const selectedConversation = conversations?.find(
    (c) => c.otherUser?.id === selectedUser
  );

  return (
    <Layout showRightSidebar={false}>
      <div className="flex h-[calc(100vh-60px)] lg:h-screen">
        {/* Conversations list */}
        <div className="w-full lg:w-[350px] border-r border-[#2f3336] flex flex-col">
          <div className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-[#2f3336] px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="lg:hidden p-2 rounded-full hover:bg-[#16181c] transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="font-bold text-xl text-[#e7e9ea]">Messages</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#1d9bf0]" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedUser(conv.otherUser?.id || null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[#2f3336] hover:bg-[#16181c] transition-colors text-left ${
                    selectedUser === conv.otherUser?.id ? "bg-[#16181c]" : ""
                  }`}
                >
                  <img
                    src={conv.otherUser?.avatar || "/avatar-1.jpg"}
                    alt={conv.otherUser?.name || "User"}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#e7e9ea] text-sm truncate">
                        {conv.otherUser?.displayName || conv.otherUser?.name || "User"}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#1d9bf0] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[#71767b] text-sm truncate">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <MessageSquare size={48} className="text-[#2f3336] mb-4" />
                <h2 className="text-xl font-bold text-[#e7e9ea] mb-2">
                  No messages yet
                </h2>
                <p className="text-[#71767b]">
                  Start a conversation with another operator.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="hidden lg:flex flex-1 flex-col">
          {selectedUser && selectedConversation ? (
            <>
              {/* Thread header */}
              <div className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-[#2f3336] px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.otherUser?.avatar || "/avatar-1.jpg"}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/profile/${selectedConversation.otherUser?.unionId}`}
                      className="font-bold text-[#e7e9ea] hover:underline"
                    >
                      {selectedConversation.otherUser?.displayName ||
                        selectedConversation.otherUser?.name ||
                        "User"}
                    </Link>
                    <p className="text-[#71767b] text-sm">
                      @{selectedConversation.otherUser?.unionId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {threadData?.messages
                  ?.slice()
                  .reverse()
                  .map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[15px] ${
                            isOwn
                              ? "bg-[#1d9bf0] text-white rounded-br-sm"
                              : "bg-[#2f3336] text-[#e7e9ea] rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Input */}
              <div className="border-t border-[#2f3336] px-4 py-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Transmit a message..."
                    className="flex-1 bg-[#202327] text-[#e7e9ea] placeholder-[#71767b] rounded-full py-3 px-4 outline-none focus:ring-2 focus:ring-[#1d9bf0]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageContent.trim() || sendMessage.isPending}
                    className="p-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white rounded-full transition-colors disabled:opacity-50"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Mail size={48} className="text-[#2f3336] mb-4" />
              <h2 className="text-xl font-bold text-[#e7e9ea] mb-2">
                Select a conversation
              </h2>
              <p className="text-[#71767b]">
                Choose a conversation from the list to view messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
