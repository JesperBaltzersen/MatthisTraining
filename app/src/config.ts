/**
 * Auth is disabled when VITE_AUTH_ENABLED is explicitly "false".
 * Omit or set to any other value to keep auth enabled.
 */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";
