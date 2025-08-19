// app/selectors/tests/holdings.test.ts
import { describe, it, expect } from 'vitest'
import { computeHoldings } from '../holdings'
import type { Transaction } from '../../types'

describe('computeHoldings', () => {
  it('accumulates BUYs into quantity and totalCost', () => {
    const txs: Transaction[] = [
      { id:'t1', accountId:'A', date:'2025-01-01', action:'BUY', symbol:'XEQT.TO', assetCategory:'ETF', currency:'CAD', quantity:10, price:30 },
      { id:'t2', accountId:'A', date:'2025-01-02', action:'BUY', symbol:'XEQT.TO', assetCategory:'ETF', currency:'CAD', quantity:5,  price:40 },
    ]
    const rows = computeHoldings(txs)
    expect(rows).toHaveLength(1)
    expect(rows[0].quantity).toBe(15)
    expect(rows[0].totalCost).toBe(10*30 + 5*40)
    expect(rows[0].avgCost).toBeCloseTo((10*30 + 5*40)/15, 6)
  })

  it('reduces via SELL at average cost', () => {
    const txs: Transaction[] = [
      { id:'t1', accountId:'A', date:'2025-01-01', action:'BUY',  symbol:'ABC', assetCategory:'STK', currency:'CAD', quantity:10, price:10 },
      { id:'t2', accountId:'A', date:'2025-01-10', action:'BUY',  symbol:'ABC', assetCategory:'STK', currency:'CAD', quantity:10, price:20 },
      { id:'t3', accountId:'A', date:'2025-02-01', action:'SELL', symbol:'ABC', assetCategory:'STK', currency:'CAD', quantity:10, price:0  },
    ]
    const rows = computeHoldings(txs)
    // 20 total qty buy at blended avg 15; sell 10 reduces totalCost by 10*15
    expect(rows[0].quantity).toBe(10)
    expect(rows[0].avgCost).toBeCloseTo(15, 6)
    expect(rows[0].totalCost).toBeCloseTo(10*15, 6)
  })

  it('produces separate rows per account+symbol', () => {
    const txs: Transaction[] = [
      { id:'t1', accountId:'A', date:'2025-01-01', action:'BUY', symbol:'ZZZ', assetCategory:'STK', currency:'CAD', quantity:1, price:100 },
      { id:'t2', accountId:'B', date:'2025-01-01', action:'BUY', symbol:'ZZZ', assetCategory:'STK', currency:'CAD', quantity:2, price:50  },
    ]
    const rows = computeHoldings(txs).sort((x,y)=> (x.accountId+x.symbol).localeCompare(y.accountId+y.symbol))
    expect(rows).toHaveLength(2)
    expect(rows[0].accountId).toBe('A')
    expect(rows[1].accountId).toBe('B')
  })
})
