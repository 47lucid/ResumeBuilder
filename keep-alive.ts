import http from 'node:http';
import https from 'node:https';
import { env, exit } from 'node:process';

/**
 * 🚀 LaunchPad Keep-Alive Script
 * --------------------------------
 * Pings your frontend and backend services every 14 minutes to prevent
 * Render's free tier from spinning them down.
 *
 * Usage:
 *   KEEP_ALIVE_URLS="https://frontend.onrender.com,https://backend.onrender.com/health" npx tsx keep-alive.ts
 *
 * Environment Variables:
 *   KEEP_ALIVE_URLS     — Comma-separated URLs to ping (required)
 *   KEEP_ALIVE_INTERVAL — Interval in minutes (default: 14)
 */

const rawUrls: string = env.KEEP_ALIVE_URLS ?? '';
const URLs: string[] = rawUrls
  .split(',')
  .map((u: string) => u.trim())
  .filter((u: string) => u.length > 0);

const INTERVAL_MINS: number = parseInt(env.KEEP_ALIVE_INTERVAL ?? '14', 10);
const INTERVAL_MS: number = INTERVAL_MINS * 60 * 1000;

if (URLs.length === 0) {
  console.error('❌ ERROR: KEEP_ALIVE_URLS is not set or empty.');
  console.log('Usage:');
  console.log('  KEEP_ALIVE_URLS="https://app1.onrender.com,https://app2.onrender.com/health" npx tsx keep-alive.ts');
  exit(1);
}

if (isNaN(INTERVAL_MINS) || INTERVAL_MINS <= 0) {
  console.error('❌ ERROR: KEEP_ALIVE_INTERVAL must be a positive number (minutes).');
  exit(1);
}

function ping(url: string): void {
  const timestamp = new Date().toLocaleTimeString();
  const lib: typeof https | typeof http = url.startsWith('https') ? https : http;

  const req = lib.get(url, (res: http.IncomingMessage) => {
    const status: number = res.statusCode ?? 0;
    // Consume response body to free up the socket
    res.resume();

    if (status >= 200 && status < 300) {
      console.log(`[${timestamp}] ✅ ${url} → ${status} OK`);
    } else {
      console.warn(`[${timestamp}] ⚠️  ${url} → ${status} (unexpected)`);
    }
  });

  req.on('error', (err: Error) => {
    console.error(`[${timestamp}] ❌ ${url} → Error: ${err.message}`);
  });

  req.setTimeout(10_000);
  req.on('timeout', () => {
    req.destroy(new Error('Request timed out after 10s'));
  });

  req.end();
}

function pingAll(): void {
  const now = new Date().toLocaleTimeString();
  console.log(`\n[${now}] 📡 Pinging ${URLs.length} target(s)...`);
  URLs.forEach(ping);
  console.log(`[${now}] ⏱  Next ping in ${INTERVAL_MINS} min(s).`);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
console.log('=========================================');
console.log('🚀 LaunchPad Keep-Alive Service');
console.log(`   Targets  : ${URLs.join(', ')}`);
console.log(`   Interval : ${INTERVAL_MINS} minute(s)`);
console.log('=========================================');

pingAll();
setInterval(pingAll, INTERVAL_MS);
