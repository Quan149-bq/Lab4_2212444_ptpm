import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

// Hàm helper để highlight từ khóa trong văn bản
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  // Tạo Regex để tìm từ khóa (không phân biệt hoa thường)
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-200 text-gray-900 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = "" } = await searchParams;
  const supabase = await createClient();

  let posts: any[] = [];

  if (query) {
    const { data } = await supabase.rpc("search_posts", {
      query_text: query,
    });
    posts = data || [];
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
      </h1>

      {posts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 italic">
            Không tìm thấy bài viết nào phù hợp với từ khóa của bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group border-b border-gray-100 pb-8 last:border-0"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                  {/* Áp dụng Highlight cho Tiêu đề */}
                  <HighlightedText text={post.title} query={query} />
                </h2>
              </Link>

              <p className="text-gray-600 line-clamp-3 leading-relaxed mb-4">
                {/* Áp dụng Highlight cho Tóm tắt (nếu cần) */}
                <HighlightedText text={post.excerpt || ""} query={query} />
              </p>

              <Link
                href={`/posts/${post.slug}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Đọc tiếp <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
