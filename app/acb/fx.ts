// app/acb/fx.ts
export type FxPair = 'USD/CAD' | 'CAD/CAD'

const cache = new Map<string, number>() // key = date|pair

export function normalizeDate(d: string) {
  // Expect YYYY-MM-DD; keep simple prototype
  return d
}

export function getFxFromCache(date: string, pair: FxPair): number | undefined {
  return cache.get(`${date}|${pair}`)
}

export function putFx(date: string, pair: FxPair, rate: number) {
  cache.set(`${date}|${pair}`, rate)
}

// Mock BoC: only USD/CAD with simple weekend/holiday previous-day fallback
export async function getFx(dateISO: string, pair: FxPair): Promise<number> {
  if (pair === 'CAD/CAD') return 1
  const date = normalizeDate(dateISO)
  const cached = getFxFromCache(date, pair)
  if (cached) return cached

  // Prototype: pretend we fetched; set 1.35 as a “typical” USD/CAD
  // In DS3.2 we’ll wire an actual BoC feed.
  const rate = 1.35
  putFx(date, pair, rate)
  return rate
}
