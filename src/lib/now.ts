import { connection } from "next/server";

/**
 * The current time, read at request time.
 *
 * Prices depend on promotion schedules, so they must never be baked into a
 * prerendered page. Calling this marks the calling component as request-time
 * (it must sit inside a <Suspense> boundary).
 */
export async function requestNow(): Promise<Date> {
  await connection();
  return new Date();
}
