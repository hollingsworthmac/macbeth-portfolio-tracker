// src/lib/acbEngine.ts
import type { Transaction } from '../../app/types'

export interface ACBResult {
  acb: number         // Adjusted Cost Base (CAD)
  shares: number      // Remaining quantity
  avgPrice: number    // Average price per share
}

export function calculateACB(transactions: Transaction[]): ACBResult {
  let acb = 0
  let shares = 0

  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      acb += tx.quantity * tx.price
      shares += tx.quantity
    } else if (tx.type === 'SELL') {
      if (shares <= 0) {
        throw new Error(`Edge case: Selling without holdings at ${tx.date}`)
      }
      const avgPrice = acb / shares
      acb -= avgPrice * tx.quantity
      shares -= tx.quantity
    }
  }

  return {
    acb,
    shares,
    avgPrice: shares > 0 ? acb / shares : 0,
  }
}
