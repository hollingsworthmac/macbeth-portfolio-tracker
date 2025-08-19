'use client';

import React from 'react';
import { useAppStore } from '../store/appStore';

export default function AccountsPage() {
  const accounts = useAppStore((s) => s.accounts);

  return (
    <main>
      <h2>Accounts</h2>

      {/* Add Account link */}
      <p style={{ margin: '12px 0' }}>
        <a href="/accounts/new">+ Add Account</a>
      </p>
<p style={{ margin: '12px 0' }}>
  <a href="/transactions/new">+ Add Transaction</a>
</p>
      <ul>
        {accounts.map((a) => (
          <li key={a.id}>
            <strong>{a.alias}</strong> — {a.holder} @ {a.broker} — {a.accountType} — {a.baseCurrency}{' '}
            {a.registered ? '(Registered)' : '(Non-Registered)'}
          </li>
        ))}
      </ul>
    </main>
  );
}
