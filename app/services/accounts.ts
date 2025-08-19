// app/services/accounts.ts
import type { Account } from '../types'
import { useAppStore } from '../store/appStore'

/** simple id helper; replace with nanoid later if you want */
const makeId = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`

export const AccountsService = {
  list(): Account[] {
    return useAppStore.getState().accounts
  },

  byId(id: string): Account | undefined {
    return useAppStore.getState().accounts.find(a => a.id === id)
  },

  create(a: Omit<Account, 'id'>): Account {
    const account: Account = { id: makeId('acc'), ...a }
    useAppStore.getState().addAccount(account)
    return account
  },
}
