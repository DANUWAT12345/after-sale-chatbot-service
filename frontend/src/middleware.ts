import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

console.log("MIDDLEWARE FILE LOADED");

export async function middleware(req: NextRequest) {
  // Add to your middleware
  console.log("All cookies:", req.cookies.getAll());
  console.log("All headers:", Object.fromEntries(req.headers.entries()));
  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    "";
  if (!token) {
    console.log("No token found");
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    // Log the decoded admin payload for debugging
    console.log("Decoded admin payload:", payload);
    // Check if the user has the Admin role
    if (payload.role !== "Admin") {
      console.log("Access denied: not an admin");
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }
}

export const config = {
  matcher: ['/dashboard/admin-dashboard/:path*'],
};
