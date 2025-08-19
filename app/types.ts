// app/types.ts
export type AccountType = 'TFSA' | 'RRSP' | 'RRIF/LIF' | 'MARGIN' | 'CRYPTO' | 'RESP' | 'FHSA'
export type Currency = 'CAD' | 'USD'
export type AssetCategory = 'ETF' | 'STK' | 'CRYPTO' | 'OPT' | 'BOND' | 'MUT'

export type TxAction =
  | 'BUY' | 'SELL' | 'TRANSFER' | 'DIVIDEND' | 'INTEREST'
  | 'REINVEST_DIVIDEND' | 'WITHHOLDING_TAX' | 'FEE'
  | 'DEPOSIT' | 'WITHDRAWAL' | 'STOCK_SPLIT' | 'ROC'
  | 'CORPORATE_ACTION'

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
  action: TxAction
  symbol: string
  assetCategory: AssetCategory
  currency: Currency
  quantity: number // negative allowed for shorts / written options
  price: number
  notes?: string
  strategyId?: string
}
