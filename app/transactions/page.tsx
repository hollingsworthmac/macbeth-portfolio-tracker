'use client'

import React from 'react'
import Link from 'next/link'
import { getTransactions, deleteTransaction } from '../services/transactions'
import type { Transaction } from '../types'

export default function TransactionsPage() {
  // Keep server and first client render identical
  const [mounted, setMounted] = React.useState(false)
  const [txs, setTxs] = React.useState<Transaction[]>([])

  React.useEffect(() => {
    setMounted(true)
    setTxs(getTransactions())
  }, [])

  const onDelete = (id: string) => {
    deleteTransaction(id)
    setTxs(getTransactions())
  }

  const Table = (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Account</th>
          <th>Action</th>
          <th>Symbol</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Currency</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {txs.length === 0 ? (
          <tr>
            <td colSpan={8}>No transactions</td>
          </tr>
        ) : (
          txs.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.accountAlias ?? t.accountId}</td>
              <td>{t.action}</td>
              <td>{t.symbol}</td>
              <td>{t.quantity}</td>
              <td>{t.price}</td>
              <td>{t.currency}</td>
              <td>
                <button onClick={() => onDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )

  // While not mounted, render the same stable shell the server output renders.
  if (!mounted) {
    return (
      <main suppressHydrationWarning>
        <h2>Transactions</h2>
        <p>
          <Link href="/transactions/new">+ Add Transaction</Link>
        </p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Account</th>
              <th>Action</th>
              <th>Symbol</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Currency</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8}>Loading…</td>
            </tr>
          </tbody>
        </table>
      </main>
    )
  }

  return (
    <main>
      <h2>Transactions</h2>
      <p>
        <Link href="/transactions/new">+ Add Transaction</Link>
      </p>
      {Table}
    </main>
  )
}
