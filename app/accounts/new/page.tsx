// app/accounts/new/page.tsx (replace the form + handlers)
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AccountsService } from '../../services/accounts'
import type { AccountType, Currency } from '../../types'

const ACCOUNT_TYPES: AccountType[] = ['TFSA','RRSP','RRIF/LIF','MARGIN','CRYPTO','RESP','FHSA']
const CURRENCIES: Currency[] = ['CAD','USD']

export default function NewAccountPage() {
  const [alias, setAlias] = useState('')
  const [holder, setHolder] = useState('')
  const [broker, setBroker] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [baseCurrency, setBaseCurrency] = useState<Currency>('CAD')
  const [accountType, setAccountType] = useState<AccountType>('TFSA')
  const [registered, setRegistered] = useState(true)
  const [msg, setMsg] = useState<string>('')

  const errors = {
    alias: alias.trim() ? '' : 'Alias is required',
    holder: holder.trim() ? '' : 'Holder is required',
  }
  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasErrors) return
    AccountsService.create({
      alias, holder, broker, accountNumber, baseCurrency, accountType, registered
    })
    setMsg('✅ Account created')
    setAlias(''); setHolder(''); setBroker(''); setAccountNumber('')
  }

  return (
    <div>
      <h2>New Account</h2>
      <form onSubmit={onSubmit} style={{ display:'grid', gap: 8, maxWidth: 520 }}>
        <div>
          <input placeholder="Alias" value={alias} onChange={e=>setAlias(e.target.value)} />
          {errors.alias && <div style={{ color:'crimson', fontSize:12 }}>{errors.alias}</div>}
        </div>
        <div>
          <input placeholder="Holder" value={holder} onChange={e=>setHolder(e.target.value)} />
          {errors.holder && <div style={{ color:'crimson', fontSize:12 }}>{errors.holder}</div>}
        </div>
        <input placeholder="Broker" value={broker} onChange={e=>setBroker(e.target.value)} />
        <input placeholder="Account Number" value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} />

        <label>Base Currency
          <select value={baseCurrency} onChange={e=>setBaseCurrency(e.target.value as Currency)}>
            {CURRENCIES.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label>Account Type
          <select value={accountType} onChange={e=>setAccountType(e.target.value as AccountType)}>
            {ACCOUNT_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label>
          <input type="checkbox" checked={registered} onChange={e=>setRegistered(e.target.checked)} />
          {' '}Registered
        </label>

        <button type="submit" disabled={hasErrors} style={{ opacity: hasErrors ? 0.6 : 1 }}>
          Create
        </button>
      </form>

      {msg && <p>{msg}</p>}
      <p style={{ marginTop: 12 }}><Link href="/accounts">← Back to Accounts</Link></p>
    </div>
  )
}
