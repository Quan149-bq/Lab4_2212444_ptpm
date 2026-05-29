import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Sửa lỗi lấy dữ liệu: Thêm !posts_author_id_fkey để chỉ định rõ lấy Profile của tác giả
  const { data: posts, error } = await supabase
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
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // 2. Kiểm tra lỗi và hiển thị thông báo thay vì để trang trắng
  if (error) {
    console.error("Error fetching posts:", error.message);
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 bg-red-50 p-4 rounded-md">
          Có lỗi xảy ra khi tải bài viết: {error.message}
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bài viết mới nhất</h1>

      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              <Link href={`/posts/${post.slug}`}>
                {/* Fix class blue600 -> blue-600 */}
                <h2 className="text-2xl font-semibold hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="text-gray-600 mt-2">{post.excerpt}</p>
              )}

              {/* Fix class gray500 -> gray-500 */}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>Bởi {post.profiles?.display_name || "Ẩn danh"}</span>
                <span>•</span>
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("vi-VN")
                    : "Chưa xuất bản"}
                </span>
              </div>

              <Link
                href={`/posts/${post.slug}`}
                className="inline-block mt-4 text-blue-600 hover:text-blue-500"
              >
                Đọc tiếp →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chưa có bài viết nào được xuất bản.</p>
        </div>
      )}
    </main>
  );
}
