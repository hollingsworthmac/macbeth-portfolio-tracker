// src/lib/pricingService.ts
export async function fetchPrice(symbol: string): Promise<number> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
    )
    const data = await res.json()
    return data.quoteResponse.result[0]?.regularMarketPrice ?? 0
  } catch (err) {
    console.error(`Failed to fetch price for ${symbol}`, err)
    return 0
  }
}
