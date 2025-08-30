// app/acb/engine.ts
import type { Transaction } from '../types'
import { getFxRateCADPerUnit } from '../services/fx'

export type HoldingRow = {
  accountId: string
  symbol: string
  qty: number
  acbPerUnitCAD: number
  acbTotalCAD: number
}

/**
 * ACB v2 (CAD)
 * - Maintains per (accountId, symbol) lot
 * - BUY increases qty and ACB by (qty * price * FX + fees * FX)
 * - SELL reduces qty and ACB proportionally (average-cost method); realized P/L ignored here
 * - Other actions currently ignored for ACB; extend as needed
 */
export async function calculateACBv2(txs: Transaction[]): Promise<Map<string, HoldingRow>> {
  // sort by date, then id for determinism
  const sorted = [...txs].sort((a,b) => (a.date.localeCompare(b.date) || a.id.localeCompare(b.id)))
  const map = new Map<string, HoldingRow>()

  for (const t of sorted) {
    const key = `${t.accountId}::${t.symbol.toUpperCase()}`
    const curr = map.get(key) ?? {
      accountId: t.accountId,
      symbol: t.symbol.toUpperCase(),
      qty: 0,
      acbPerUnitCAD: 0,
      acbTotalCAD: 0,
    }

    // Convert price & fees to CAD (fees not on model yet; leave 0)
    const fx = await getFxRateCADPerUnit(t.date, t.currency)
    const tradeValueCAD = t.quantity * t.price * fx
    const feesCAD = 0 // wire here when you add fees to Transaction
    const withholdingCAD = 0 // for dividends, etc., when added

    switch (t.action) {
      case 'BUY': {
        const newQty = curr.qty + t.quantity
        const newAcb = curr.acbTotalCAD + tradeValueCAD + feesCAD
        curr.qty = newQty
        curr.acbTotalCAD = newAcb
        curr.acbPerUnitCAD = newQty > 0 ? newAcb / newQty : 0
        break
      }
      case 'SELL': {
        const sellQty = t.quantity
        if (sellQty <= 0 || sellQty > curr.qty) {
          // ignore invalid sell; in production you’d surface a validation error
          break
        }
        // average-cost method: reduce ACB proportionally by quantity
        const acbPerUnit = curr.acbPerUnitCAD
        const acbReduction = acbPerUnit * sellQty
        curr.qty = curr.qty - sellQty
        curr.acbTotalCAD = Math.max(0, curr.acbTotalCAD - acbReduction) // realized handled elsewhere
        curr.acbPerUnitCAD = curr.qty > 0 ? curr.acbTotalCAD / curr.qty : 0
        break
      }
      // Extend these as needed:
      case 'DIVIDEND':
      case 'INTEREST':
      case 'REINVEST_DIVIDEND':
      case 'TRANSFER':
      case 'WITHHOLDING_TAX':
      case 'FEE':
      case 'DEPOSIT':
      case 'WITHDRAWAL':
      case 'STOCK_SPLIT':
      case 'ROC':
      case 'CORPORATE_ACTION':
      default:
        // no-op for now in v2
        break
    }

    map.set(key, curr)
  }

  // prune zero qty rows
  for (const [k, v] of map.entries()) {
    if (!v.qty) map.delete(k)
  }
  return map
}
