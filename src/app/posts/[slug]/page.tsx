import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommentForm } from "@/components/posts/comment-form";
import { CommentList } from "@/components/posts/comment-list";
import { LikeButton } from "@/components/posts/like-button";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return {
    title: post?.title || "Bài viết",
    description: post?.excerpt || "",
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Lấy bài viết (Đã fix lỗi Ambiguous Relationships bằng !posts_author_id_fkey)
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles!posts_author_id_fkey (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (postError || !post) {
    notFound();
  }

  // 2. Lấy danh sách bình luận
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  // 3. Kiểm tra thông tin người dùng hiện tại
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Lấy tổng số lượt Like của bài viết từ bảng likes
  const { count: likesCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", post.id);

  // 5. Kiểm tra xem người dùng hiện tại đã nhấn Like bài này chưa
  let isLiked = false;
  if (user) {
    const { data: likeData } = await supabase
      .from("likes")
      .select("user_id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle(); // Dùng maybeSingle để tránh báo lỗi nếu chưa like
    if (likeData) isLiked = true;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-gray-500 mb-6">
            <span>Bởi {post.profiles?.display_name || "Ẩn danh"}</span>
            <span>•</span>
            <time>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Chưa xuất bản"}
            </time>
          </div>

          {/* Nút thả tim (Like/Unlike) */}
          <LikeButton
            postId={post.id}
            initialLikesCount={likesCount || 0}
            initialIsLiked={isLiked}
            userId={user?.id}
          />
        </header>

        <div className="prose prose-lg max-w-none mb-12">
          {post.content?.split("\n").map((paragraph: string, index: number) => {
            // Kiểm tra nếu dòng đó là cú pháp ảnh Markdown ![alt](url)
            const imgRegex = /!\[.*\]\((.*)\)/;
            const match = paragraph.match(imgRegex);

            if (match) {
              return (
                <img
                  key={index}
                  src={match[1]}
                  alt="Blog content"
                  className="rounded-lg my-6 w-full"
                />
              );
            }

            return (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>

      {/* Khu vực Bình luận */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Bình luận ({comments?.length || 0})
        </h2>

        {user ? (
          <div className="mb-8">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <p className="text-gray-500 mb-8 italic">
            Vui lòng{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              đăng nhập
            </a>{" "}
            để tham gia thảo luận.
          </p>
        )}

        <CommentList comments={comments || []} />
      </section>
    </main>
  );
}
