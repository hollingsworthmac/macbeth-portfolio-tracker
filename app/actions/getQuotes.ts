'use server'

/**
 * Quote fetcher: Yahoo Quote → Yahoo Chart (daily close) → Stooq fallback
 * - Handles TSX (.TO) & other Canadian suffixes
 * - Skips "N/D" and "No data" rows from Stooq
 * - Logs failures so we can add symbol-specific mappings if ever needed
 */

type CCY = 'CAD' | 'USD'

export type QuoteOut = {
  symbol: string
  currency: CCY
  price: number
  time: string
  source: 'Yahoo' | 'Stooq'
}

/* ------------------------------- Utilities ------------------------------- */

const NOW_ISO = () => new Date().toISOString()

function inferCurrency(sym: string): CCY {
  const u = sym.toUpperCase()
  if (u.endsWith('.TO') || u.endsWith('.V') || u.endsWith('.CN') || u.endsWith('.NE')) return 'CAD'
  return 'USD'
}

function cleanSym(s: string) {
  return s.trim().replace(/\s+/g, '')
}

function unique(items: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const it of items) {
    if (!seen.has(it)) { out.push(it); seen.add(it) }
  }
  return out
}

/* ------------------------------ YAHOO QUOTE ------------------------------ */

async function fetchYahooBatch(symbols: string[]) {
  const map = new Map<string, { price: number; time: string }>()
  if (!symbols.length) return map

  const q = symbols.map(encodeURIComponent).join(',')
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${q}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      console.warn(`[Yahoo/quote] HTTP ${res.status} for ${symbols.join(', ')}`)
      return map
    }
    const json = await res.json()
    const rows: any[] = json?.quoteResponse?.result ?? []

    for (const r of rows) {
      const sym = String(r?.symbol ?? '').toUpperCase()
      const price = r?.regularMarketPrice ?? r?.postMarketPrice ?? r?.preMarketPrice
      if (sym && price != null && isFinite(price) && price > 0) {
        const ts =
          (r?.regularMarketTime && new Date(r.regularMarketTime * 1000).toISOString()) ||
          NOW_ISO()
        map.set(sym, { price: Number(price), time: ts })
      }
    }
  } catch (err) {
    console.warn(`[Yahoo/quote] fetch error for ${symbols.join(', ')}:`, err)
  }
  return map
}

/* ------------------------------ YAHOO CHART ------------------------------ */
/** Per‑symbol fallback: last daily close via chart API (often works for .TO ETFs) */
async function fetchYahooChart(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=1mo&interval=1d`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      console.warn(`[Yahoo/chart] HTTP ${res.status} for ${symbol}`)
      return null
    }
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null

    const closes: number[] =
      result?.indicators?.adjclose?.[0]?.adjclose ??
      result?.indicators?.quote?.[0]?.close ??
      []

    // grab last non-null close
    for (let i = closes.length - 1; i >= 0; i--) {
      const v = closes[i]
      if (v != null && isFinite(v) && v > 0) {
        const ts = result?.timestamp?.[i]
        const iso = ts ? new Date(ts * 1000).toISOString() : NOW_ISO()
        return { price: Number(v), time: iso }
      }
    }
    return null
  } catch (err) {
    console.warn(`[Yahoo/chart] fetch error for ${symbol}:`, err)
    return null
  }
}

/* --------------------------- STOOQ (FALLBACK) ---------------------------- */

function stooqCandidates(sym: string): string[] {
  const u = sym.trim().toUpperCase()
  const base = u.replace(/\.[A-Z]+$/, '')
  const b = base.toLowerCase()

  if (u.endsWith('.TO')) return [`${b}.to`, b, `${b}.ca`]
  if (u.endsWith('.V'))  return [`${b}.v`, b]
  if (u.endsWith('.CN') || u.endsWith('.NE')) return [`${b}.cn`, b]

  if (u.includes('.')) return [u.toLowerCase(), b, `${b}.us`]
  return [`${b}.us`, b]
}

function parseLightCsv(csv: string): { last?: number; iso?: string } {
  const txt = csv.trim()
  if (!txt || /^no data$/i.test(txt)) return {}
  const lines = txt.split(/\r?\n/)
  if (!lines.length) return {}

  if (/^symbol\s*,\s*last/i.test(lines[0])) {
    if (lines.length < 2) return {}
    const header = lines[0].split(',')
    const row = lines[1].split(',')
    const hIdx = (name: string) =>
      header.findIndex((h) => h.trim().toLowerCase() === name)
    const iLast = hIdx('last')
    const iDate = hIdx('date')
    const iTime = hIdx('time')
    const raw = (row[iLast] ?? '').trim()
    if (!raw || /^n\/d$/i.test(raw)) return {}
    const last = Number(raw.replace(/[^0-9.\-]/g, ''))
    const d = (row[iDate] ?? '').trim()
    const t = (row[iTime] ?? '00:00:00').trim()
    const iso = d ? new Date(`${d}T${t}Z`).toISOString() : NOW_ISO()
    return isFinite(last) && last > 0 ? { last, iso } : {}
  }

  const row = lines[0].split(',')
  if (row.length >= 4) {
    const raw = (row[1] ?? '').trim()
    if (!raw || /^n\/d$/i.test(raw)) return {}
    const last = Number(raw.replace(/[^0-9.\-]/g, ''))
    if (!(isFinite(last) && last > 0)) return {}
    const d = (row[2] ?? '').trim()
    const t = (row[3] ?? '00:00:00').trim()
    const iso = d ? new Date(`${d}T${t}Z`).toISOString() : NOW_ISO()
    return { last, iso }
  }
  return {}
}

function parseFullCsv(csv: string): { close?: number; iso?: string } {
  const txt = csv.trim()
  if (!txt || /^no data$/i.test(txt)) return {}
  const lines = txt.split(/\r?\n/)
  if (lines.length < 2) return {}
  const header = lines[0].split(',')
  const row = lines[1].split(',')
  const hIdx = (name: string) =>
    header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase())
  const iClose = hIdx('Close')
  const iDate = hIdx('Date')
  const iTime = hIdx('Time')
  const raw = (row[iClose] ?? '').trim()
  if (!raw || /^n\/d$/i.test(raw)) return {}
  const close = Number(raw.replace(/[^0-9.\-]/g, ''))
  if (!(isFinite(close) && close > 0)) return {}
  const d = (row[iDate] ?? '').trim()
  const t = (row[iTime] ?? '00:00:00').trim()
  const iso = d ? new Date(`${d}T${t}Z`).toISOString() : NOW_ISO()
  return { close, iso }
}

function parseDailyCsv(csv: string): { lastClose?: number } {
  const txt = csv.trim()
  if (!txt || /^no data$/i.test(txt)) return {}
  const lines = txt.split(/\r?\n/)
  if (lines.length < 2) return {}
  const last = lines[lines.length - 1].split(',')
  const raw = (last[4] ?? '').trim()
  if (!raw || /^n\/d$/i.test(raw)) return {}
  const close = Number(raw.replace(/[^0-9.\-]/g, ''))
  return isFinite(close) && close > 0 ? { lastClose: close } : {}
}

async function fetchStooqSingle(yahooSymbol: string) {
  const candidates = stooqCandidates(yahooSymbol)
  for (const s of candidates) {
    try {
      const url = `https://stooq.com/q/l/?s=${encodeURIComponent(s)}&f=sl1d1t1&e=csv`
      const r = await fetch(url, { cache: 'no-store' })
      if (r.ok) {
        const csv = await r.text()
        const { last, iso } = parseLightCsv(csv)
        if (last !== undefined) return { price: last, time: iso ?? NOW_ISO() }
      }
    } catch {}

    try {
      const url = `https://stooq.com/q/l/?s=${encodeURIComponent(s)}&f=sd2t2ohlcv&h&e=csv`
      const r = await fetch(url, { cache: 'no-store' })
      if (r.ok) {
        const csv = await r.text()
        const { close, iso } = parseFullCsv(csv)
        if (close !== undefined) return { price: close, time: iso ?? NOW_ISO() }
      }
    } catch {}

    try {
      const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(s)}&i=d`
      const r = await fetch(url, { cache: 'no-store' })
      if (r.ok) {
        const csv = await r.text()
        const { lastClose } = parseDailyCsv(csv)
        if (lastClose !== undefined) return { price: lastClose, time: NOW_ISO() }
      }
    } catch {}
  }
  return { price: 0, time: NOW_ISO() }
}

/* --------------------------------- MAIN ---------------------------------- */

export async function getQuotesAction(rawSymbols: string[]): Promise<QuoteOut[]> {
  if (!rawSymbols?.length) return []

  const cleaned = unique(rawSymbols.map(cleanSym).filter(Boolean))
  const yahooMap = await fetchYahooBatch(cleaned)

  const out: QuoteOut[] = []
  for (const orig of cleaned) {
    const u = orig.toUpperCase()
    const ccy = inferCurrency(u)

    // 1) Yahoo quote
    const y = yahooMap.get(u)
    if (y) {
      out.push({ symbol: orig, currency: ccy, price: y.price, time: y.time, source: 'Yahoo' })
      continue
    }

    // 2) Yahoo chart (daily close)
    const chart = await fetchYahooChart(u)
    if (chart && chart.price > 0) {
      out.push({ symbol: orig, currency: ccy, price: chart.price, time: chart.time, source: 'Yahoo' })
      continue
    }

    // 3) Stooq
    const s = await fetchStooqSingle(u)
    if (s.price > 0) {
      out.push({ symbol: orig, currency: ccy, price: s.price, time: s.time, source: 'Stooq' })
      continue
    }

    console.warn(`[Quotes] Unresolved symbol after all fallbacks: ${orig}`)
    out.push({ symbol: orig, currency: ccy, price: 0, time: NOW_ISO(), source: 'Stooq' })
  }

  return out
}
