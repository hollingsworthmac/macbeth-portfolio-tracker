// app/services/pricing.ts
// Calls /api/quotes?symbols=A,B,C and returns a normalized map:
// { [SYMBOL]: { price: number, source: string } }

export type PriceMap = Record<string, { price: number; source: string }>;

const norm = (s: string) => s.trim().toUpperCase();

export async function getLastPrices(symbols: string[]): Promise<PriceMap> {
  const list = Array.from(new Set(symbols.map(norm)));
  if (list.length === 0) return {};

  // single batched request to your plural endpoint
  const qs = encodeURIComponent(list.join(','));
  const res = await fetch(`/api/quotes?symbols=${qs}`, { cache: 'no-store' });

  if (!res.ok) {
    console.warn('[pricing] /api/quotes failed:', res.status);
    return {};
  }

  const json = await res.json();
  const out: PriceMap = {};

  // Accept both shapes: array or object-map
  if (Array.isArray(json)) {
    for (const item of json) {
      const sym = norm(item?.symbol ?? item?.ticker ?? '');
      const raw = item?.price ?? item?.last ?? item?.c; // be flexible
      const price = Number(raw);
      if (sym && Number.isFinite(price)) {
        out[sym] = { price, source: item?.source ?? 'Stooq' };
      }
    }
  } else if (json && typeof json === 'object') {
    for (const [symRaw, v] of Object.entries(json)) {
      const sym = norm(symRaw);
      const raw = (v as any)?.price ?? (v as any)?.last ?? (v as any)?.c;
      const price = Number(raw);
      if (Number.isFinite(price)) {
        out[sym] = { price, source: (v as any)?.source ?? 'Stooq' };
      }
    }
  } else {
    console.warn('[pricing] Unexpected /api/quotes payload:', json);
  }

  return out;
}
