export type TxAction =
  | 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL'
  | 'DIVIDEND' | 'INTEREST' | 'REINVEST_DIVIDEND'
  | 'ROC' | 'STOCK_SPLIT' | 'WITHHOLDING_TAX'

export interface Transaction {
  id: string
  accountId: string
  date: string // ISO YYYY-MM-DD
  action: TxAction
  symbol: string
  assetCategory: 'ETF' | 'STK' | 'CRYPTO' | 'OPT' | 'BOND' | 'MUT'
  currency: 'CAD' | 'USD'
  quantity: number         // negative only for SELL (or future shorts)
  price: number            // in tx currency
  fees?: number            // in tx currency (default 0)
  withholdingTax?: number  // in tx currency (default 0; use for US divs)
  fxRateOverride?: number  // CAD per 1 unit of tx currency (optional)
  notes?: string
  strategyId?: string
}
