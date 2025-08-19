import { create } from 'zustand'

/** Types (initial pass; we’ll refine in DS2) */
export type AccountType = 'TFSA' | 'RRSP' | 'RRIF/LIF' | 'MARGIN' | 'CRYPTO' | 'RESP' | 'FHSA'
export type Currency = 'CAD' | 'USD'
export type AssetCategory = 'ETF' | 'STK' | 'CRYPTO' | 'OPT' | 'BOND' | 'MUT'

export interface Account {
  id: string
  alias: string
  holder: string
  broker: string
  accountNumber: string
  baseCurrency: Currency
  accountType: AccountType
  registered: boolean
}

export interface Transaction {
  id: string
  accountId: string
  date: string // ISO YYYY-MM-DD
  action:
    | 'BUY' | 'SELL' | 'TRANSFER' | 'DIVIDEND' | 'INTEREST'
    | 'REINVEST_DIVIDEND' | 'WITHHOLDING_TAX' | 'FEE'
    | 'DEPOSIT' | 'WITHDRAWAL' | 'STOCK_SPLIT' | 'ROC'
    | 'CORPORATE_ACTION'
  symbol: string
  assetCategory: AssetCategory
  currency: Currency
  quantity: number // negative allowed for shorts / written options
  price: number
  notes?: string
  strategyId?: string
}

/** Store shape */
type StoreState = {
  accounts: Account[]
  transactions: Transaction[]
  addAccount: (a: Account) => void
  addTransaction: (t: Transaction) => void
}

/** Seed data (mock) */
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

/** Zustand store */
export const useAppStore = create<StoreState>((set) => ({
  accounts: seedAccounts,
  transactions: seedTransactions,
  addAccount: (a) => set((s) => ({ accounts: [...s.accounts, a] })),
  addTransaction: (t) => set((s) => ({ transactions: [...s.transactions, t] })),
}))
