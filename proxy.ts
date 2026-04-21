import { auth } from "@/auth";

export const proxy = auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|api/auth).*)",
  ],
};
