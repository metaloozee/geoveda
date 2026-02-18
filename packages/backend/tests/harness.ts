import { convexTest } from "convex-test";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.{ts,js}");

export const createBackendTest = () => convexTest(schema, modules);
export type BackendTest = ReturnType<typeof createBackendTest>;
