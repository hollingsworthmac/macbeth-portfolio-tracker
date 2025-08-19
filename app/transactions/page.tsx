'use client';

import React from 'react';
import { useAppStore } from '../store/appStore';

export default function TransactionsPage() {
  const txs = useAppStore((s) => s.transactions);

  return (
    <main>
      <h2>Transactions</h2>
      <p style={{ margin: '12px 0' }}>
  <a href="/transactions/new">+ Add Transaction</a>
</p>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Account</th><th>Action</th><th>Symbol</th><th>Qty</th><th>Price</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.accountId}</td>
              <td>{t.action}</td>
              <td>{t.symbol}</td>
              <td>{t.quantity}</td>
              <td>{t.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
