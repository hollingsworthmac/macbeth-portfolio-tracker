'use client'

import { useMemo } from 'react'
import { useAppStore } from '../store/appStore'
import { computeHoldings } from '../selectors/holdings'

export default function HoldingsPage() {
  const txs = useAppStore(s => s.transactions)
  const holdings = useMemo(() => computeHoldings(txs), [txs])

  return (
    <main>
      <h2>Holdings (Derived)</h2>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Avg Cost</th>
            <th>Total Cost</th>
            <th>Market Value (stub)</th>
            <th>Unrealized (stub)</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(h => {
            const marketValue = 0 // DS3: plug live prices
            const unreal = marketValue - h.totalCost
            return (
              <tr key={`${h.accountId}-${h.symbol}`}>
                <td>{h.accountId}</td>
                <td>{h.symbol}</td>
                <td>{h.quantity}</td>
                <td>{h.avgCost.toFixed(2)}</td>
                <td>{h.totalCost.toFixed(2)}</td>
                <td>{marketValue.toFixed(2)}</td>
                <td>{unreal.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{ marginTop: 12, fontSize: 12 }}>
        * Simple cost math for prototype. DS3 will replace with full ACB rules, fees, FX, transfers, splits, options, etc.
      </p>
    </main>
  )
}
