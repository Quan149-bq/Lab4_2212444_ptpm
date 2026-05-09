"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
  userId?: string;
}

export function LikeButton({
  postId,
  initialLikesCount,
  initialIsLiked,
  userId,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleToggleLike = async () => {
    // Yêu cầu đăng nhập nếu chưa có userId
    if (!userId) {
      alert("Bạn cần đăng nhập để thả tim bài viết!");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Đã like -> Bấm vào để Unlike (Xóa khỏi bảng likes)
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) throw error;
        setLikesCount((prev) => prev - 1);
        setIsLiked(false);
      } else {
        // Chưa like -> Bấm vào để Like (Thêm vào bảng likes)
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: userId });

        if (error) throw error;
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Lỗi khi thả tim:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
        isLiked
          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {/* Icon trái tim */}
      <svg
        className={`w-5 h-5 ${isLiked ? "fill-current" : "fill-none stroke-current"}`}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="font-medium">{likesCount}</span>
    </button>
  );
}
