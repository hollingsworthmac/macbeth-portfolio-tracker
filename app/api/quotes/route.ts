// app/api/quotes/route.ts
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

/** Simple CSV price fetch from Stooq for ONE symbol */
async function stooqPrice(symbol: string): Promise<number> {
  try {
    // stooq expects lower-case symbols; TSX tickers use .to suffix (already ok)
    const url = `https://stooq.com/q/l/?s=${symbol.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`;
    const text = await fetch(url, { cache: 'no-store' }).then(r => r.text());

    const lines = text.trim().split('\n');
    if (lines.length < 2) return 0; // header + row

    const row = lines[1].split(',');
    // stooq columns: Symbol,Date,Time,Open,High,Low,Close,Volume
    const close = parseFloat(row[6]);
    return Number.isFinite(close) ? close : 0;
  } catch (e) {
    console.warn('[Stooq] error for', symbol, e);
    return 0;
  }
}

/** Try Yahoo for a batch; return a map symbol->price */
async function yahooPrices(symbols: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  try {
    const res = await yahooFinance.quote(symbols);
    const list = Array.isArray(res) ? res : [res];

    for (const q of list) {
      // Yahoo sometimes returns nulls; prefer regularMarketPrice
      const sym = (q?.symbol ?? '').toUpperCase();
      const price = Number(q?.regularMarketPrice ?? 0);
      if (sym && Number.isFinite(price) && price > 0) {
        out[sym] = price;
      }
    }
  } catch (e) {
    console.warn('[Yahoo] batch failed', e);
  }
  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get('symbols');
  if (!symbolsParam) {
    return NextResponse.json(
      { error: 'Missing symbols query param' },
      { status: 400 }
    );
  }

  const symbols = symbolsParam
    .split(',')
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);

  // 1) Try Yahoo for the whole batch
  const yMap = await yahooPrices(symbols);

  // 2) Build results, falling back to Stooq PER SYMBOL if Yahoo missed/0
  const results = await Promise.all(
    symbols.map(async (sym) => {
      let price = yMap[sym] ?? 0;

      if (!price || !Number.isFinite(price)) {
        price = await stooqPrice(sym);
        return { symbol: sym, price, source: 'Stooq' as const };
      }
      return { symbol: sym, price, source: 'Yahoo' as const };
    })
  );

  return NextResponse.json(results);
}
