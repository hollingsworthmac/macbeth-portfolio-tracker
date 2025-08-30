// app/services/transactions.ts
'use client'

import { STORAGE_KEYS, readJSON, writeJSON, migrateTxIfNeeded } from './storage'
import type { Transaction } from '../types'

/** Read all transactions (after migrating any legacy keys) */
export function getTransactions(): Transaction[] {
  // try canonical
  let list = readJSON<Transaction[]>(STORAGE_KEYS.tx, [])
  if (!list.length) {
    // migrate any legacy keys into the canonical key
    list = migrateTxIfNeeded<Transaction>()
  }
  return list
}

export function saveTransactions(list: Transaction[]) {
  writeJSON(STORAGE_KEYS.tx, list)
}

export function addTransaction(t: Transaction) {
  const list = getTransactions()
  list.push(t)
  saveTransactions(list)
}

export function deleteTransaction(id: string) {
  const list = getTransactions().filter(x => x.id !== id)
  saveTransactions(list)
}

export function clearAllTransactions() {
  saveTransactions([])
}
