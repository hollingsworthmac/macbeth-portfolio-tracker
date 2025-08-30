'use client'

import React from 'react'
import { calculateACBv2, type HoldingRow } from '../acb/engine'
import { getTransactions } from '../services/transactions'
import { getLastPrices } from '../services/pricing'   
type PriceMap = Record<string, { price: number; source: string }>

export default function HoldingsPage() {
  const [rows, setRows]   = React.useState<HoldingRow[]>([])
  const [prices, setPrices] = React.useState<PriceMap>({})

  React.useEffect(() => {
    async function load() {
      const txs = getTransactions()
      const map = await calculateACBv2(txs)
      const list = Array.from(map.values())
      setRows(list)

      if (list.length) {
        // request prices for the unique set of symbols
        const symbols = Array.from(new Set(list.map(r => r.symbol)))
        try {
          const p = await getLastPrices(symbols)
          setPrices(p)
        } catch (e) {
          console.warn('[Holdings] pricing failed:', e)
          setPrices({})
        }
      } else {
        setPrices({})
      }
    }
    load()
  }, [])

  return (
    <main>
      <h2>Holdings</h2>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        * Prototype ACB v2 + live pricing. FX conversion of market value to CAD will be added in DS3.2.
      </p>

      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Symbol</th>
            <th>Qty</th>
            <th>ACB/Unit (CAD)</th>
            <th>ACB Total (CAD)</th>
            <th>Last Price</th>
            <th>Source</th>
            <th>Market Value</th>
            <th>Unrealized</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={9}>No holdings yet.</td></tr>
          ) : rows.map((r) => {
              // ---- these lines MUST be inside the map so `r` is defined ----
              const key   = r.symbol.toUpperCase()
              const p     = prices[key]
              const last  = p?.price ?? 0
              const mv    = last * r.qty          // NOTE: not FX-adjusted yet
              const unreal = mv - r.acbTotalCAD
              // ----------------------------------------------------------------
              return (
                <tr key={`${r.accountId}::${r.symbol}`}>
                  <td>{r.accountId}</td>
                  <td>{r.symbol}</td>
                  <td>{r.qty}</td>
                  <td>{r.acbPerUnitCAD.toLocaleString(undefined, { style: 'currency', currency: 'CAD' })}</td>
                  <td>{r.acbTotalCAD.toLocaleString(undefined, { style: 'currency', currency: 'CAD' })}</td>
                  <td>{last}</td>
                  <td>{p?.source ?? ''}</td>
                  <td>{mv.toLocaleString(undefined, { style: 'currency', currency: 'CAD' })}</td>
                  <td style={{ color: unreal >= 0 ? 'green' : 'crimson' }}>
                    {unreal.toLocaleString(undefined, { style: 'currency', currency: 'CAD' })}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </main>
  )
}
