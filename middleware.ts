import { auth as middleware } from "@/auth";

export { middleware };

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|api/auth).*)",
  ],
};
