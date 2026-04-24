import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, Sparkles, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  replyToId?: number;
}

export default function ComposeModal({ open, onClose, replyToId }: ComposeModalProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getFeed.invalidate();
      setContent("");
      setImageUrl("");
      onClose();
    },
  });

  const augmentMutation = trpc.ai.augmentPost.useMutation({
    onSuccess: (data) => {
      setAiTyping(true);
      let i = 0;
      const typeInterval = setInterval(() => {
        i++;
        if (i >= data.augmented.length) {
          clearInterval(typeInterval);
          setAiTyping(false);
          setContent(data.augmented);
        } else {
          setContent(data.augmented.slice(0, i));
        }
      }, 30);
    },
  });

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost.mutate({
      content: content.trim(),
      imageUrl: imageUrl || undefined,
      replyToId,
    });
  };

  const charCount = content.length;
  const maxChars = 280;
  const progress = Math.min((charCount / maxChars) * 100, 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-20 lg:top-24 lg:left-1/2 lg:-translate-x-1/2 lg:w-[600px] bg-black border border-[#2f3336] rounded-2xl z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f3336]">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#16181c] transition-colors"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || charCount > maxChars || createPost.isPending}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                  content.trim() && charCount <= maxChars
                    ? "bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white"
                    : "bg-[#1d9bf0]/50 text-white/50 cursor-not-allowed"
                }`}
              >
                {createPost.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Post"
                )}
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-4 flex gap-3">
              <img
                src={user?.avatar || "/avatar-1.jpg"}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={replyToId ? "Post your reply" : "What's happening?"}
                  className="w-full bg-transparent text-[#e7e9ea] text-lg placeholder-[#71767b] outline-none resize-none min-h-[120px]"
                  rows={4}
                />
                {imageUrl && (
                  <div className="mt-2 relative rounded-2xl overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Upload"
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* AI Augment */}
                {content.length > 0 && !aiTyping && (
                  <button
                    onClick={() => augmentMutation.mutate({ content })}
                    disabled={augmentMutation.isPending}
                    className="mt-2 flex items-center gap-2 text-[#1d9bf0] text-sm hover:bg-[#1d9bf0]/10 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Sparkles size={14} />
                    {augmentMutation.isPending ? "Augmenting..." : "Augment with AI"}
                  </button>
                )}

                {/* Action bar */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2f3336]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const url = prompt("Enter image URL:");
                        if (url) setImageUrl(url);
                      }}
                      className="p-2 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors"
                    >
                      <Image size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Character progress */}
                    <div className="relative w-6 h-6">
                      <svg className="w-6 h-6 -rotate-90" viewBox="0 0 32 32">
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="#2f3336"
                          strokeWidth="2"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke={charCount > maxChars ? "#f4212e" : "#1d9bf0"}
                          strokeWidth="2"
                          strokeDasharray={`${progress * 0.88} 100`}
                          className="transition-all"
                        />
                      </svg>
                      {charCount > maxChars * 0.8 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                          {maxChars - charCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
