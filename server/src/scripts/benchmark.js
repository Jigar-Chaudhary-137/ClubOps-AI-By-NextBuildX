/**
 * ClubOps AI — Performance & Concurrency Benchmark Runner
 * 
 * Measures actual REST and AI API latencies under configurable concurrent loads.
 * Reports latency percentiles (avg, median, p95, p99, min, max), RPS, and memory metrics.
 */

const http = require('http');
const app = require('../app');
const { connectDB, disconnectDB } = require('../db/connection');

let server = null;
let baseUrl = process.env.API_BASE_URL || '';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const url = new URL(path, baseUrl);
    const headers = { ...(options.headers || {}) };
    let postData = null;

    if (options.body) {
      postData = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers,
      agent: false
    };

    const req = http.request(reqOptions, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        const latency = Date.now() - start;
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch (e) {
          parsed = rawData;
        }
        resolve({
          status: res.statusCode,
          latencyMs: latency,
          body: parsed
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 500,
        latencyMs: Date.now() - start,
        error: err.message
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Runs a batch of concurrent requests against a target endpoint.
 */
async function benchmarkEndpoint({ name, path, method = 'GET', body = null, headers = {}, totalRequests = 100, concurrency = 20 }) {
  console.log(`\n▶ Benchmarking: ${name} [${method} ${path}]`);
  console.log(`  Requests: ${totalRequests} | Concurrency: ${concurrency}`);

  const latencies = [];
  let successful = 0;
  let failed = 0;

  const queue = Array.from({ length: totalRequests }, (_, idx) => idx);
  const startTime = Date.now();

  async function worker() {
    while (queue.length > 0) {
      queue.pop();
      const res = await makeRequest(path, { method, body, headers });
      latencies.push(res.latencyMs);
      if (res.status >= 200 && res.status < 400) {
        successful++;
      } else {
        failed++;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, totalRequests) }, () => worker());
  await Promise.all(workers);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const median = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = Math.round((totalRequests / (totalTimeSec || 0.001)) * 10) / 10;

  console.log(`  Success:  ${successful}/${totalRequests} (${Math.round((successful / totalRequests) * 100)}%) | RPS: ${rps}`);
  console.log(`  Latencies: Avg: ${avg}ms | Med: ${median}ms | P95: ${p95}ms | P99: ${p99}ms | Min: ${min}ms | Max: ${max}ms`);

  return {
    name,
    path,
    method,
    totalRequests,
    concurrency,
    successful,
    failed,
    rps,
    avgMs: avg,
    medianMs: median,
    p95Ms: p95,
    p99Ms: p99,
    minMs: min,
    maxMs: max
  };
}

async function runBenchmarks() {
  console.log('============================================================');
  console.log('       CLUBOPS AI — PERFORMANCE & CONCURRENCY BENCHMARK     ');
  console.log('============================================================');

  const initialMemory = process.memoryUsage();
  console.log(`Initial Process Memory: RSS: ${Math.round(initialMemory.rss / (1024 * 1024))}MB | Heap: ${Math.round(initialMemory.heapUsed / (1024 * 1024))}MB\n`);

  await connectDB();

  if (!baseUrl) {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  }

  const results = [];
  const TOTAL = parseInt(process.env.BENCHMARK_REQUESTS, 10) || 100;
  const CONCURRENCY = parseInt(process.env.BENCHMARK_CONCURRENCY, 10) || 20;

  try {
    // 1. Authenticate to obtain token
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'lead@club.edu', password: 'Password123!' }
    });
    const token = loginRes.body.data?.token || '';
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Suite 1: Health Diagnostic Latency
    results.push(
      await benchmarkEndpoint({
        name: 'Basic Health Check',
        path: '/api/health',
        method: 'GET',
        totalRequests: TOTAL,
        concurrency: CONCURRENCY
      })
    );

    results.push(
      await benchmarkEndpoint({
        name: 'Full Subsystem Diagnostics',
        path: '/api/health/full',
        method: 'GET',
        totalRequests: Math.min(50, TOTAL),
        concurrency: Math.min(10, CONCURRENCY)
      })
    );

    // Suite 2: Read CRUD APIs
    results.push(
      await benchmarkEndpoint({
        name: 'Event List Retrieval',
        path: '/api/events',
        method: 'GET',
        headers: authHeaders,
        totalRequests: TOTAL,
        concurrency: CONCURRENCY
      })
    );

    results.push(
      await benchmarkEndpoint({
        name: 'Task Board Scoped Query',
        path: '/api/tasks',
        method: 'GET',
        headers: authHeaders,
        totalRequests: TOTAL,
        concurrency: CONCURRENCY
      })
    );

    results.push(
      await benchmarkEndpoint({
        name: 'Unread Notifications Count',
        path: '/api/notifications/unread-count',
        method: 'GET',
        headers: authHeaders,
        totalRequests: TOTAL,
        concurrency: CONCURRENCY
      })
    );

    // Suite 3: RAG Knowledge Base Vector Search
    results.push(
      await benchmarkEndpoint({
        name: 'RAG Semantic Vector Search',
        path: '/api/ai/knowledge/search',
        method: 'POST',
        headers: authHeaders,
        body: { query: 'sponsorship tiers and invoicing rules', limit: 3 },
        totalRequests: Math.min(60, TOTAL),
        concurrency: Math.min(10, CONCURRENCY)
      })
    );

  } catch (err) {
    console.error('💥 Benchmark runner encountered an error:', err);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }

  // Final Memory and Latency Summary Table
  const finalMemory = process.memoryUsage();
  const heapDeltaMb = Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024) * 100) / 100;

  console.log('\n========================================================================================================');
  console.log('                                  PERFORMANCE BENCHMARK SUMMARY TABLE                                   ');
  console.log('========================================================================================================');
  console.log('Endpoint / Operation              | Requests | Concurrency | Success | RPS     | Avg(ms) | P95(ms) | P99(ms)');
  console.log('----------------------------------+----------+-------------+---------+---------+---------+---------+--------');
  results.forEach((r) => {
    const name = r.name.padEnd(33, ' ');
    const reqs = String(r.totalRequests).padStart(8, ' ');
    const conc = String(r.concurrency).padStart(11, ' ');
    const succ = `${Math.round((r.successful / r.totalRequests) * 100)}%`.padStart(7, ' ');
    const rps = String(r.rps).padStart(7, ' ');
    const avg = `${r.avgMs}ms`.padStart(7, ' ');
    const p95 = `${r.p95Ms}ms`.padStart(7, ' ');
    const p99 = `${r.p99Ms}ms`.padStart(7, ' ');
    console.log(`${name} | ${reqs} | ${conc} | ${succ} | ${rps} | ${avg} | ${p95} | ${p99}`);
  });
  console.log('========================================================================================================');
  console.log(`Memory Observation: Initial Heap: ${Math.round(initialMemory.heapUsed / (1024*1024))}MB | Final Heap: ${Math.round(finalMemory.heapUsed / (1024*1024))}MB (Delta: ${heapDeltaMb}MB)`);
  console.log('========================================================================================================\n');
}

if (require.main === module) {
  runBenchmarks().then(() => {
    process.exit(0);
  });
}

module.exports = { runBenchmarks };
