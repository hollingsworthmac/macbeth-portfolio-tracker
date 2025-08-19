// app/store/appStore.ts
import { create } from 'zustand'
import type { Account, Transaction } from '../types'

// Store shape
type StoreState = {
  accounts: Account[]
  transactions: Transaction[]
  addAccount: (a: Account) => void
  addTransaction: (t: Transaction) => void
}

// Seed data
const seedAccounts: Account[] = [
  {
    id: 'acc-001',
    alias: 'Mac-TFSA',
    holder: 'Mac',
    broker: 'Questrade',
    accountNumber: 'QT-12345',
    baseCurrency: 'CAD',
    accountType: 'TFSA',
    registered: true,
  },
  {
    id: 'acc-002',
    alias: 'Beth-Margin',
    holder: 'Beth',
    broker: 'IBKR',
    accountNumber: 'U1234567',
    baseCurrency: 'USD',
    accountType: 'MARGIN',
    registered: false,
  },
]

const seedTransactions: Transaction[] = [
  {
    id: 'tx-001',
    accountId: 'acc-001',
    date: '2025-08-01',
    action: 'BUY',
    symbol: 'XEQT.TO',
    assetCategory: 'ETF',
    currency: 'CAD',
    quantity: 10,
    price: 35.5,
    notes: 'Initial buy',
  },
  {
    id: 'tx-002',
    accountId: 'acc-002',
    date: '2025-08-05',
    action: 'WITHDRAWAL',
    symbol: 'BTC',
    assetCategory: 'CRYPTO',
    currency: 'USD',
    quantity: -0.05, // example: moving crypto out
    price: 0,
    notes: 'Wallet withdrawal',
  },
]

// Zustand store
export const useAppStore = create<StoreState>((set) => ({
  accounts: seedAccounts,
  transactions: seedTransactions,
  addAccount: (a) => set((s) => ({ accounts: [...s.accounts, a] })),
  addTransaction: (t) => set((s) => ({ transactions: [...s.transactions, t] })),
}))
