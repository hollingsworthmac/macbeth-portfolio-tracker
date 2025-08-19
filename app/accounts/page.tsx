'use client';

import React from 'react';
import { useAppStore } from '../store/appStore';

export default function AccountsPage(): JSX.Element {
  const accounts = useAppStore((s) => s.accounts);

  return (
    <main>
      <h2>Accounts</h2>
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
