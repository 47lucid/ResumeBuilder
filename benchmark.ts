#!/usr/bin/env tsx
/**
 * Local Benchmark Script for LaunchPad Backend
 * ---------------------------------------------
 * Runs a series of HTTP load tests against the running backend.
 * Requires: npm install -g autocannon  (or npx autocannon)
 *
 * Usage:
 *   BACKEND_URL=http://localhost:8080 npx tsx benchmark.ts
 */

import { execSync } from 'node:child_process';
import { env } from 'node:process';

const BASE = (env.BACKEND_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const DURATION = parseInt(env.BENCH_DURATION ?? '10', 10); // seconds
const CONNECTIONS = parseInt(env.BENCH_CONNECTIONS ?? '50', 10);

interface Endpoint {
  name: string;
  path: string;
  method?: string;
  body?: string;
  contentType?: string;
}

const endpoints: Endpoint[] = [
  {
    name: 'Health Check (GET /health)',
    path: '/health',
  },
  {
    name: 'Metrics (GET /api/metrics)',
    path: '/api/metrics',
  },
  {
    name: 'Waitlist Join (POST /api/waitlist)',
    path: '/api/waitlist',
    method: 'POST',
    body: JSON.stringify({ email: `bench_${Date.now()}@test.com`, source: 'benchmark' }),
    contentType: 'application/json',
  },
];

function runBenchmark(ep: Endpoint): void {
  const url = `${BASE}${ep.path}`;
  const method = ep.method ?? 'GET';

  let cmd = `npx --yes autocannon -c ${CONNECTIONS} -d ${DURATION} -m ${method}`;
  if (ep.body) {
    cmd += ` -b '${ep.body}'`;
    cmd += ` -H 'Content-Type: ${ep.contentType ?? 'application/json'}'`;
  }
  cmd += ` --json "${url}"`;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`🔥 ${ep.name}`);
  console.log(`   URL: ${url} | Connections: ${CONNECTIONS} | Duration: ${DURATION}s`);
  console.log('─'.repeat(60));

  try {
    const raw = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const result = JSON.parse(raw);

    const rps = result.requests?.average ?? 0;
    const latencyMean = result.latency?.mean ?? 0;
    const latencyP99 = result.latency?.p99 ?? 0;
    const errors = result.errors ?? 0;
    const non2xx = result.non2xx ?? 0;

    console.log(`  ✅ Requests/sec (avg) : ${rps.toFixed(0)}`);
    console.log(`  ⏱  Latency mean       : ${latencyMean.toFixed(2)} ms`);
    console.log(`  ⏱  Latency p99        : ${latencyP99.toFixed(2)} ms`);
    console.log(`  ❌ Errors             : ${errors}`);
    console.log(`  ⚠️  Non-2xx responses  : ${non2xx}`);
  } catch (e: unknown) {
    const err = e as Error & { stderr?: string };
    console.error(`  ❌ Benchmark failed: ${err.message}`);
    if (err.stderr) console.error(err.stderr);
  }
}

// First verify the server is reachable
console.log(`\n🚀 LaunchPad Backend Benchmark`);
console.log(`   Target: ${BASE}`);

try {
  execSync(`curl -sf ${BASE}/health`, { stdio: 'pipe' });
  console.log(`   Status: ✅ Server is up\n`);
} catch {
  console.error(`   Status: ❌ Cannot reach ${BASE}/health — is the server running?`);
  process.exit(1);
}

endpoints.forEach(runBenchmark);

console.log(`\n${'═'.repeat(60)}`);
console.log(`✅ All benchmarks complete.`);
console.log(`${'═'.repeat(60)}\n`);
