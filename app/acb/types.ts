import type { Currency, TxAction, AssetCategory } from '../types'

export interface TxInput {
  id: string
  accountId: string
  holder?: string
  symbol: string
  date: string           // ISO YYYY-MM-DD
  action: TxAction
  assetCategory: AssetCategory
  quantity: number       // +buy/drip, -sell; splits/mergers handled separately
  price: number          // per unit, tx currency; 0 for splits/transfers if no price
  fees?: number          // tx currency
  currency: Currency     // CAD or USD
  notes?: string
  strategyId?: string
  fxOverride?: number    // optional explicit FX (tx->CAD)
}

export interface FxRate {
  date: string
  from: Currency
  to: Currency
  rate: number           // multiply tx.amount * rate to get 'to' currency
  source: 'BoC' | 'PrevBoC' | 'Override' | 'Other'
}

export interface FxProvider {
  getRate(date: string, from: Currency, to: Currency): Promise<FxRate>
}

export interface AcbLot {
  date: string
  accountId: string
  symbol: string
  quantity: number
  acbCadTotal: number
  acbCadPerUnit: number
  superficialLossDeferred?: number
  notes?: string
}

export interface RealizedGain {
  date: string
  accountId: string
  symbol: string
  proceedsCad: number
  acbCadDisposed: number
  gainLossCad: number
  superficialLossApplied?: number
}

export interface AcbResult {
  finalLots: Record<string, AcbLot>  // key `${accountId}::${symbol}`
  ledger: Array<{ txId: string; before?: AcbLot; after: AcbLot; realized?: RealizedGain }>
}

export interface AcbOptions {
  applySuperficialLossRule: boolean
  treatRocAsAcbReduction: boolean
  optionsContractMultiplier: number  // default 100 for options (future use)
}
