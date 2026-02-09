import { betterAuth } from "better-auth/minimal";
import { createAuthOptions } from "../auth";

export const auth = betterAuth(createAuthOptions());
