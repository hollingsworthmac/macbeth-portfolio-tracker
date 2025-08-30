// app/services/accounts.ts
export type AppAccount = {
  id: string;        // use this in transactions.accountId
  alias: string;     // human friendly
  holder: string;
  broker: string;
  baseCurrency: 'CAD' | 'USD';
  accountType: 'TFSA' | 'RRSP' | 'RRIF/LIF' | 'MARGIN' | 'CRYPTO' | 'RESP' | 'FHSA';
  registered: boolean;
};

const STORAGE_KEY = 'mbpt:accounts';

const seed: AppAccount[] = [
  {
    id: 'acc-001',
    alias: 'Mac-TFSA',
    holder: 'Mac',
    broker: 'Questrade',
    baseCurrency: 'CAD',
    accountType: 'TFSA',
    registered: true,
  },
  {
    id: 'acc-002',
    alias: 'Beth-Margin',
    holder: 'Beth',
    broker: 'IBKR',
    baseCurrency: 'USD',
    accountType: 'MARGIN',
    registered: false,
  },
];

function ensureSeed() {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

export function getAccounts(): AppAccount[] {
  ensureSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppAccount[]) : [];
  } catch {
    return [];
  }
}

export function findAccount(idOrAlias: string): AppAccount | undefined {
  const all = getAccounts();
  return all.find(a => a.id === idOrAlias || a.alias === idOrAlias);
}

function persist(list: AppAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function nextId(existing: AppAccount[]): string {
  // simple, deterministic id generator
  let i = existing.length + 1;
  let id = `acc-${String(i).padStart(3, '0')}`;
  while (existing.some(a => a.id === id)) {
    i += 1;
    id = `acc-${String(i).padStart(3, '0')}`;
  }
  return id;
}

export function addAccount(input: Omit<AppAccount, 'id'>): AppAccount {
  const all = getAccounts();

  // simple duplicate alias check
  if (all.some(a => a.alias.toLowerCase() === input.alias.toLowerCase())) {
    throw new Error(`Account alias "${input.alias}" already exists.`);
  }

  const created: AppAccount = { ...input, id: nextId(all) };
  const updated = [...all, created];
  persist(updated);
  return created;
}
