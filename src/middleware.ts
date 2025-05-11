import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken");
  const publicRoutes = ["/login", "/register", "/trips"];

  // Nếu đã đăng nhập và đang ở route public hoặc chính xác trang chủ
  if (accessToken && (publicRoutes.some((route) => pathname.startsWith(route)) || pathname === "/" || pathname === "")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Nếu chưa đăng nhập và không ở route public
  if (!accessToken && !publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cần thiết
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};