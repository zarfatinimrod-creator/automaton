/**
 * Apify Actor entrypoint - Israel Open Data (data.gov.il) -> clean JSON, pay per event.
 * Events charged: 'dataset-search' (once per search run) and 'record' (per delivered record).
 */
import { Actor, log } from 'apify';
import { CkanClient, CkanError } from './ckan.js';
import { InputError, run, type ChargeResult } from './run.js';
import type { ActorInput } from './types.js';

await Actor.init();

try {
  const input = (await Actor.getInput<ActorInput>()) ?? undefined;
  const baseUrl = process.env.CKAN_BASE_URL || input?.baseUrl || 'https://data.gov.il';

  const client = new CkanClient({
    baseUrl,
    timeoutMs: Number(process.env.CKAN_TIMEOUT_MS) || 30_000,
    maxRetries: Number(process.env.CKAN_MAX_RETRIES) || 4,
    minIntervalMs: Number(process.env.CKAN_MIN_INTERVAL_MS) || 200,
    userAgent: process.env.CKAN_USER_AGENT,
    logger: log,
  });

  const charge = async (eventName: string, count: number): Promise<ChargeResult> => {
    if (count <= 0) return { chargedCount: 0, eventChargeLimitReached: false };
    const result = await Actor.charge({ eventName, count });
    return {
      chargedCount: typeof result.chargedCount === 'number' ? result.chargedCount : count,
      eventChargeLimitReached: Boolean(result.eventChargeLimitReached),
    };
  };

  const summary = await run({ ...input, baseUrl }, {
    client,
    charge,
    pushData: (items) => Actor.pushData(items),
    setValue: (key, value, options) => Actor.setValue(key, value, options),
    log,
  });

  await Actor.setValue('SUMMARY', summary);
  log.info(`Done: ${summary.returned} items, charged ${JSON.stringify(summary.charged)}, ${summary.requests} API requests, stop reason: ${summary.stoppedReason}.`);
  await Actor.exit();
} catch (err) {
  if (err instanceof InputError) {
    await Actor.fail(`Invalid input: ${err.message}`);
  } else if (err instanceof CkanError) {
    await Actor.fail(`data.gov.il ${err.action} failed [${err.kind}${err.status ? ` HTTP ${err.status}` : ''}]: ${err.message}`);
  } else {
    await Actor.fail(`Unexpected error: ${(err as Error)?.stack ?? String(err)}`);
  }
}
