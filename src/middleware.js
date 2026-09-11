import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  console.log("🔥 MIDDLEWARE RUNNING");
  console.log("➡️ PATH:", pathname);
  console.log("🔑 TOKEN:", token ? "YES" : "NO");

  if (pathname.startsWith("/Admindash") && !token) {
    console.log("🚫 NO TOKEN → REDIRECTING TO /");

    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log("✅ ALLOWED:", pathname);

  return NextResponse.next();
}

export const config = {
  matcher: ["/Admindash/:path*"],
};