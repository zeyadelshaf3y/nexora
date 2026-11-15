import { readFileSync } from 'node:fs';
import path from 'node:path';

const workspaceRoot = path.resolve(import.meta.dirname, '../..');
const base = JSON.parse(readFileSync(path.join(workspaceRoot, 'tsconfig.base.json'), 'utf8')) as {
  compilerOptions: { paths?: Record<string, string[]> };
};

export const nexoraResolveAlias = Object.fromEntries(
  Object.entries(base.compilerOptions.paths ?? {})
    .sort(([a], [b]) => b.length - a.length)
    .map(([key, targets]) => [key, path.join(workspaceRoot, targets[0]!)]),
);
