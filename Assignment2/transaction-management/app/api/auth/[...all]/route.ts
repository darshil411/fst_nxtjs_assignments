// app/api/auth/[...all]/route.ts
// Better Auth catch-all route handler

import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
