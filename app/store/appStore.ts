// app/store/appStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Account, Transaction } from '../types'

type StoreState = {
  accounts: Account[]
  transactions: Transaction[]
  addTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  deleteAllTransactions: () => void
  resetToSampleMSTR: () => void
}

/** Seed accounts — adjust to your aliases/ids if you have others */
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

const seedTransactions: Transaction[] = []

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      accounts: seedAccounts,
      transactions: seedTransactions,

      addTransaction: (t) =>
        set((s) => ({ transactions: [...s.transactions, t] })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((x) => x.id !== id),
        })),

      deleteAllTransactions: () => set({ transactions: [] }),

      resetToSampleMSTR: () =>
        set((s) => ({
          transactions: [
            {
              id: crypto.randomUUID(),
              accountId: s.accounts[1]?.id ?? 'acc-002', // Beth-Margin by default
              date: new Date().toISOString().slice(0, 10),
              action: 'BUY',
              symbol: 'MSTR',
              assetCategory: 'STK',
              currency: 'USD',
              quantity: 10,
              price: 100,
            },
          ],
        })),
    }),
    {
      name: 'mpt-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ accounts: s.accounts, transactions: s.transactions }),
    }
  )
)
