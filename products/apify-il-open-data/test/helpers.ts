import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FetchLike } from '../src/ckan.js';

const here = dirname(fileURLToPath(import.meta.url));

export function fixture(name: string): unknown {
  return JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8'));
}

export interface MockResponseSpec {
  status?: number;
  body?: unknown;
  text?: string;
  headers?: Record<string, string>;
  /** Throw this error instead of responding (simulates network failure / abort). */
  throwError?: Error;
  /** Delay before responding, ms (used with fake timers to simulate timeouts). */
  delayMs?: number;
}

export function jsonResponse(spec: MockResponseSpec): Response {
  const text = spec.text ?? (spec.body === undefined ? '' : JSON.stringify(spec.body));
  return new Response(text, {
    status: spec.status ?? 200,
    headers: { 'content-type': 'application/json', ...(spec.headers ?? {}) },
  });
}

/** Builds a fetch mock that answers requests in order and records the URLs it received. */
export function mockFetch(specs: MockResponseSpec[] | ((url: string, index: number) => MockResponseSpec)) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const impl: FetchLike = async (url, init) => {
    const index = calls.length;
    calls.push({ url, init });
    const spec = typeof specs === 'function' ? specs(url, index) : specs[Math.min(index, specs.length - 1)];
    if (!spec) throw new Error(`mockFetch: no response for request #${index} (${url})`);
    if (spec.delayMs) {
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, spec.delayMs);
        init?.signal?.addEventListener('abort', () => {
          clearTimeout(t);
          const e = new Error('The operation was aborted');
          e.name = 'AbortError';
          reject(e);
        });
      });
    }
    if (spec.throwError) throw spec.throwError;
    return jsonResponse(spec);
  };
  return { impl, calls };
}

export const noSleep = async () => {};

export const silentLog = { info: () => {}, warning: () => {}, error: () => {}, debug: () => {} };
