#!/usr/bin/env node
/**
 * Print the highest semver from stdin JSON array (e.g. npm view pkg versions --json).
 * Uses numeric segment comparison — localeCompare({ numeric: true }) is wrong for
 * versions like 0.1.14 vs 0.1.9 and 0.2.10 vs 0.2.9.
 */
import { readFileSync } from 'node:fs';

function compareSemver(a, b) {
  const pa = a.split('.').map((n) => Number(n));
  const pb = b.split('.').map((n) => Number(n));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

const raw = readFileSync(0, 'utf8');
const versions = JSON.parse(raw);
const list = Array.isArray(versions) ? versions : [versions];
if (list.length === 0) {
  process.exit(1);
}
const highest = list.reduce((max, v) => (compareSemver(v, max) > 0 ? v : max));
console.log(highest);
