'use client'
import Link from 'next/link'
import { useAppStore } from './store/appStore'

export default function HomePage() {
  const accounts = useAppStore((s) => s.accounts)
  const transactions = useAppStore((s) => s.transactions)

  return (
    <main>
      <h1>MacBeth Portfolio Tracker</h1>
      <p>Accounts: {accounts.length}</p>
      <p>Transactions: {transactions.length}</p>

      <nav style={{ marginTop: 16 }}>
        <Link href="/accounts">Accounts</Link>{' | '}
        <Link href="/transactions">Transactions</Link>
      </nav>
    </main>
  )
}
