/**
 * Centralized API configuration for LaunchPad.
 * 
 * Next.js baked-in environment variables MUST be prefixed with NEXT_PUBLIC_
 * and be available at image BUILD TIME to be available in the browser.
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Helper to build API endpoints safely
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
