import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;


  if (pathname.startsWith("/Admindash") && !token) {

    return NextResponse.redirect(new URL("/", req.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/Admindash/:path*"],
};