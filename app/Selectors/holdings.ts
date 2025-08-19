// app/selectors/holdings.ts
import type { Transaction } from '../types'

export type HoldingKey = `${string}::${string}` // `${accountId}::${symbol}`

export interface HoldingRow {
  accountId: string
  symbol: string
  quantity: number
  // simple cost metrics for now (DS3: replace with ACB)
  totalCost: number     // sum(price * qty) for BUY; reduce on SELL via avg cost
  avgCost: number       // totalCost / quantity (if quantity > 0)
}

type Running = {
  qty: number
  totalCost: number
}

export function computeHoldings(transactions: Transaction[]): HoldingRow[] {
  const map = new Map<HoldingKey, Running>()

  // process chronologically so sells use current avg cost
  const txs = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  for (const tx of txs) {
    const key: HoldingKey = `${tx.accountId}::${tx.symbol}`

    // only process position-affecting actions here
    if (!['BUY', 'SELL', 'REINVEST_DIVIDEND', 'STOCK_SPLIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT', 'ROC', 'CORPORATE_ACTION'].includes(tx.action)) {
      continue
    }

    const prev = map.get(key) ?? { qty: 0, totalCost: 0 }

    if (tx.action === 'BUY' || tx.action === 'REINVEST_DIVIDEND') {
      // increase quantity and total cost
      prev.qty += tx.quantity
      prev.totalCost += tx.quantity * tx.price
    } else if (tx.action === 'SELL') {
      // reduce quantity and total cost at current avg cost
      const avg = prev.qty > 0 ? prev.totalCost / prev.qty : 0
      prev.qty -= tx.quantity
      prev.totalCost -= tx.quantity * avg
      if (prev.qty < 0) prev.qty = 0 // guard; DS3 will handle shorts/options
      if (prev.totalCost < 0) prev.totalCost = 0
    } else if (tx.action === 'STOCK_SPLIT') {
      // here price is the split ratio denominator? (DS3: formalize)
      // for now: if quantity is positive, multiply qty by tx.quantity (ratio)
      // and adjust avg cost inversely. Expect tx.quantity to be the ratio (e.g., 2 for 2-for-1)
      const ratio = tx.quantity
      if (ratio > 0 && prev.qty > 0) {
        const avg = prev.totalCost / prev.qty
        prev.qty = prev.qty * ratio
        prev.totalCost = avg * (prev.qty) // total cost unchanged; avg cut by 1/ratio
      }
    } else if (tx.action === 'TRANSFER') {
      // ignore for now; DS3: handle between accounts with preserved cost
      continue
    } else if (tx.action === 'WITHDRAWAL' || tx.action === 'DEPOSIT') {
      // ignore cash-only actions here
      continue
    } else if (tx.action === 'ROC') {
      // reduce totalCost by amount provided in price*quantity (placeholder)
      prev.totalCost = Math.max(0, prev.totalCost - (tx.price * tx.quantity))
    } else {
      // CORPORATE_ACTION (placeholder, no-op)
    }

    map.set(key, prev)
  }

  const rows: HoldingRow[] = []
  for (const [key, r] of map.entries()) {
    if (r.qty <= 0) continue
    const [accountId, symbol] = key.split('::')
    rows.push({
      accountId,
      symbol,
      quantity: r.qty,
      totalCost: r.totalCost,
      avgCost: r.qty > 0 ? r.totalCost / r.qty : 0,
    })
  }
  return rows
}
