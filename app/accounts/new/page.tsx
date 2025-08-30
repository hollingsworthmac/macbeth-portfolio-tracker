'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import type { AppAccount } from '../../services/accounts'
import { addAccount } from '../../services/accounts'

const ACCOUNT_TYPES: AppAccount['accountType'][] = [
  'TFSA', 'RRSP', 'RRIF/LIF', 'MARGIN', 'CRYPTO', 'RESP', 'FHSA'
]
const CURRENCIES: AppAccount['baseCurrency'][] = ['CAD', 'USD']

export default function NewAccountPage() {
  const [alias, setAlias] = useState('New Account')
  const [holder, setHolder] = useState('Owner')
  const [broker, setBroker] = useState('Broker')
  const [baseCurrency, setBaseCurrency] = useState<AppAccount['baseCurrency']>('CAD')
  const [accountType, setAccountType] = useState<AppAccount['accountType']>('TFSA')
  const [registered, setRegistered] = useState(true)
  const [error, setError] = useState<string>('')

  const canSave = useMemo(() => alias.trim().length > 0, [alias])

  function onSave() {
    setError('')
    try {
      addAccount({
        alias: alias.trim(),
        holder: holder.trim(),
        broker: broker.trim(),
        baseCurrency,
        accountType,
        registered,
      })
      // Go back to Accounts list
      window.location.href = '/accounts'
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create account')
    }
  }

  return (
    <main>
      <h2>New Account</h2>

      <div style={{display:'grid', gridTemplateColumns:'160px 1fr', gap:8, maxWidth:520}}>
        <label>Alias</label>
        <input value={alias} onChange={e=>setAlias(e.target.value)} />

        <label>Holder</label>
        <input value={holder} onChange={e=>setHolder(e.target.value)} />

        <label>Broker</label>
        <input value={broker} onChange={e=>setBroker(e.target.value)} />

        <label>Base Currency</label>
        <select value={baseCurrency} onChange={e=>setBaseCurrency(e.target.value as AppAccount['baseCurrency'])}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Account Type</label>
        <select value={accountType} onChange={e=>setAccountType(e.target.value as AppAccount['accountType'])}>
          {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label>Registered</label>
        <input type="checkbox" checked={registered} onChange={e=>setRegistered(e.target.checked)} />
      </div>

      {error && <p style={{color:'crimson', marginTop:8}}>{error}</p>}

      <div style={{ marginTop: 12, display:'flex', gap:12 }}>
        <button onClick={onSave} disabled={!canSave}>Save</button>
        <Link href="/accounts">Cancel</Link>
      </div>
    </main>
  )
}
