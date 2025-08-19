// app/transactions/new/page.tsx (replace handlers + button bits)
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TransactionsService } from '../../services/transactions'
import { AccountsService } from '../../services/accounts'
import type { TxAction, AssetCategory, Currency } from '../../types'

const ACTIONS: TxAction[] = [
  'BUY','SELL','TRANSFER','DIVIDEND','INTEREST','REINVEST_DIVIDEND',
  'WITHHOLDING_TAX','FEE','DEPOSIT','WITHDRAWAL','STOCK_SPLIT','ROC','CORPORATE_ACTION'
]
const CATS: AssetCategory[] = ['ETF','STK','CRYPTO','OPT','BOND','MUT']
const CURRENCIES: Currency[] = ['CAD','USD']

export default function NewTransactionPage() {
  const accounts = AccountsService.list()
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [date, setDate] = useState<string>('')
  const [action, setAction] = useState<TxAction>('BUY')
  const [symbol, setSymbol] = useState('')
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('STK')
  const [currency, setCurrency] = useState<Currency>('CAD')
  const [quantity, setQuantity] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)
  const [msg, setMsg] = useState('')

  const errors = {
    accountId: accountId ? '' : 'Account is required',
    date: date ? '' : 'Date is required',
    action: action ? '' : 'Action is required',
    symbol: symbol.trim() ? '' : 'Symbol is required',
    quantity: (['BUY','SELL','REINVEST_DIVIDEND','WITHDRAWAL','DEPOSIT','STOCK_SPLIT'].includes(action) && !(quantity > 0))
      ? 'Quantity must be > 0' : '',
    price: (['BUY','SELL','REINVEST_DIVIDEND'].includes(action) && !(price >= 0))
      ? 'Price must be ≥ 0' : '',
  }
  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasErrors) return
    TransactionsService.create({
      accountId, date, action, symbol, assetCategory, currency, quantity, price
    })
    setMsg('✅ Transaction created')
    setDate(''); setSymbol(''); setQuantity(0); setPrice(0)
  }

  return (
    <div>
      <h2>New Transaction</h2>
      <form onSubmit={onSubmit} style={{ display:'grid', gap: 8, maxWidth: 520 }}>
        <label>Account
          <select value={accountId} onChange={e=>setAccountId(e.target.value)}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.alias} ({a.holder})</option>)}
          </select>
          {errors.accountId && <div style={{ color:'crimson', fontSize:12 }}>{errors.accountId}</div>}
        </label>

        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        {errors.date && <div style={{ color:'crimson', fontSize:12 }}>{errors.date}</div>}

        <label>Action
          <select value={action} onChange={e=>setAction(e.target.value as TxAction)}>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {errors.action && <div style={{ color:'crimson', fontSize:12 }}>{errors.action}</div>}
        </label>

        <input placeholder="Symbol" value={symbol} onChange={e=>setSymbol(e.target.value)} />
        {errors.symbol && <div style={{ color:'crimson', fontSize:12 }}>{errors.symbol}</div>}

        <label>Asset Category
          <select value={assetCategory} onChange={e=>setAssetCategory(e.target.value as AssetCategory)}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label>Currency
          <select value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <input type="number" step="any" placeholder="Quantity"
               value={quantity} onChange={e=>setQuantity(Number(e.target.value))} />
        {errors.quantity && <div style={{ color:'crimson', fontSize:12 }}>{errors.quantity}</div>}

        <input type="number" step="any" placeholder="Price"
               value={price} onChange={e=>setPrice(Number(e.target.value))} />
        {errors.price && <div style={{ color:'crimson', fontSize:12 }}>{errors.price}</div>}

        <button type="submit" disabled={hasErrors} style={{ opacity: hasErrors ? 0.6 : 1 }}>
          Create
        </button>
      </form>

      {msg && <p>{msg}</p>}
      <p style={{ marginTop: 12 }}><Link href="/transactions">← Back to Transactions</Link></p>
    </div>
  )
}
