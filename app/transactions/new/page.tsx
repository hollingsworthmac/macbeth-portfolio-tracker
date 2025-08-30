'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'
import type { AssetCategory, Currency, TxAction, Transaction } from '../../types'
import { addTransaction } from '../../services/transactions'
import { getAccounts } from '../../services/accounts'

const ACTIONS: TxAction[] = [
  'BUY','SELL','TRANSFER','DIVIDEND','INTEREST',
  'REINVEST_DIVIDEND','WITHHOLDING_TAX','FEE',
  'DEPOSIT','WITHDRAWAL','STOCK_SPLIT','ROC','CORPORATE_ACTION'
]
const ASSETS: AssetCategory[] = ['ETF','STK','CRYPTO','OPT','BOND','MUT']
const CURRENCIES: Currency[] = ['CAD','USD']

export default function NewTransactionPage() {
  const router = useRouter()

  // load accounts for dropdown
  const [accounts, setAccounts] = React.useState<{id:string; alias:string}[]>([])
  const [accountId, setAccountId] = React.useState<string>('')

  React.useEffect(() => {
    const list = getAccounts().map(a => ({ id: a.id, alias: a.alias }))
    setAccounts(list)
    if (list.length && !accountId) setAccountId(list[0].id) // default to first
  }, [])

  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0,10))
  const [action, setAction] = React.useState<TxAction>('BUY')
  const [symbol, setSymbol] = React.useState<string>('MSTR')
  const [assetCategory, setAssetCategory] = React.useState<AssetCategory>('STK')
  const [currency, setCurrency] = React.useState<Currency>('USD')
  const [qty, setQty] = React.useState<number>(10)
  const [price, setPrice] = React.useState<number>(100)
  const [fees, setFees] = React.useState<number>(0)
  const [withhold, setWithhold] = React.useState<number>(0)
  const [fxOverride, setFxOverride] = React.useState<string>('')

  function onSave() {
    if (!accountId) {
      alert('Please choose an account')
      return
    }
    const t: Transaction = {
      id: uuid(),
      accountId,
      date,
      action,
      symbol: symbol.trim(),
      assetCategory,
      currency,
      quantity: Number(qty),
      price: Number(price),
      notes: undefined,
      strategyId: undefined,
      // fees/withholding/fxOverride will be used by ACB engine v3; for now we persist only core fields.
    }
    addTransaction(t)
    router.push('/transactions')
  }

  return (
    <main>
      <h2>Add Transaction</h2>
      <div style={{display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:520}}>
        <label>Date</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />

        <label>Account</label>
        <select value={accountId} onChange={e=>setAccountId(e.target.value)}>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.alias}</option>)}
        </select>

        <label>Action</label>
        <select value={action} onChange={e=>setAction(e.target.value as TxAction)}>
          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label>Symbol</label>
        <input value={symbol} onChange={e=>setSymbol(e.target.value)} />

        <label>Asset</label>
        <select value={assetCategory} onChange={e=>setAssetCategory(e.target.value as AssetCategory)}>
          {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label>Currency</label>
        <select value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Qty</label>
        <input type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} />

        <label>Price</label>
        <input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} />

        <label>Fees</label>
        <input type="number" value={fees} onChange={e=>setFees(Number(e.target.value))} />

        <label>Withholding Tax</label>
        <input type="number" value={withhold} onChange={e=>setWithhold(Number(e.target.value))} />

        <label>FX override (CAD per 1 USD)</label>
        <input value={fxOverride} onChange={e=>setFxOverride(e.target.value)} placeholder="leave blank to auto-fetch later" />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={onSave}>Save</button>
      </div>
    </main>
  )
}
