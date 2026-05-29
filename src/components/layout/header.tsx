import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-yellow-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 shrink-0 hover:text-gray-800 transition-colors"
          >
            📝 Quân Blog
          </Link>

          {/* Thanh tìm kiếm và Điều hướng */}
          <div className="flex items-center gap-6 flex-1 justify-end">
            {/* Form tìm kiếm (Gửi dữ liệu qua method GET tới /search?q=...) */}
            <form
              action="/search"
              method="GET"
              className="relative hidden md:block max-w-xs w-full"
            >
              <input
                type="text"
                name="q"
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-4 pr-10 py-1.5 border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                🔍
              </button>
            </form>

            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-900 font-medium hover:bg-yellow-500 px-3 py-1 rounded transition-colors"
              >
                Trang chủ
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-900 font-medium hover:bg-yellow-500 px-3 py-1 rounded transition-colors"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    className="text-gray-900 font-medium hover:bg-yellow-500 px-3 py-1 rounded transition-colors"
                  >
                    Hồ sơ
                  </Link>

                  <form action={logout}>
                    <button
                      type="submit"
                      className="text-gray-900 font-medium hover:bg-yellow-500 px-3 py-1 rounded transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-900 font-medium hover:bg-yellow-500 px-3 py-1 rounded transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors font-semibold shadow-md"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
