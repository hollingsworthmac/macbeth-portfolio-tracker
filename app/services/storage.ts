// app/services/storage.ts
'use client'

/** All localStorage keys in one place */
export const STORAGE_KEYS = {
  tx: 'mbpt:tx',
  accounts: 'mbpt:accounts',
} as const

// Any old/legacy keys we might have used previously
const LEGACY_KEYS = {
  tx: ['mbpt:transactions', 'transactions', 'tx'],
  accounts: ['accounts'],
} as const

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    if (!v) return fallback
    return JSON.parse(v) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

/** Merge legacy arrays into the canonical key once, then remove legacy */
function migrateArray<T>(targetKey: string, legacyKeys: string[]): T[] {
  let merged: T[] = readJSON<T[]>(targetKey, [])
  for (const lk of legacyKeys) {
    const arr = readJSON<T[]>(lk, [])
    if (Array.isArray(arr) && arr.length) {
      merged = [...merged, ...arr]
      localStorage.removeItem(lk)
    }
  }
  if (merged.length) writeJSON(targetKey, merged)
  return merged
}

/** Public migrations */
export function migrateTxIfNeeded<T>(): T[] {
  return migrateArray<T>(STORAGE_KEYS.tx, LEGACY_KEYS.tx)
}

export function clearKey(key: string) {
  localStorage.removeItem(key)
}
