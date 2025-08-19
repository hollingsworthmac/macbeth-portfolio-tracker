// app/services/transactions.ts
import type { Transaction } from '../types'
import { useAppStore } from '../store/appStore'

const makeId = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`

export const TransactionsService = {
  list(): Transaction[] {
    return useAppStore.getState().transactions
  },

  byAccount(accountId: string): Transaction[] {
    return useAppStore.getState().transactions.filter(tx => tx.accountId === accountId)
  },

  create(t: Omit<Transaction, 'id'>): Transaction {
    const tx: Transaction = { id: makeId('tx'), ...t }
    useAppStore.getState().addTransaction(tx)
    return tx
  },
}
