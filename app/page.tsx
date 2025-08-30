'use client'
import Link from 'next/link'
import { getTransactions } from './services/transactions'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [txCount, setTxCount] = useState(0)
  const [accountCount, setAccountCount] = useState(0)

  useEffect(() => {
    // Transactions
    const txs = getTransactions()
    setTxCount(txs.length)

    // If you track accounts in localStorage similarly:
    try {
      const raw = localStorage.getItem('mbpt:accounts') // or use a service if you have one
      setAccountCount(raw ? JSON.parse(raw).length : 0)
    } catch {
      setAccountCount(0)
    }
  }, [])

  return (
    <main>
      <h2>MacBeth Portfolio Tracker</h2>
      <p>Accounts: {accountCount}</p>
      <p>Transactions: {txCount}</p>
      <p>
        <Link href="/accounts">Accounts</Link> |{' '}
        <Link href="/transactions">Transactions</Link>
      </p>
    </main>
  )
}
