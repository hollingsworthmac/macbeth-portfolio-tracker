// app/services/fx.ts
// Super simple mock FX. CAD->CAD = 1. For USD, returns an example rate.
// You can later plug BoC daily rates here.
export async function getFxRateCADPerUnit(dateISO: string, currency: 'CAD' | 'USD'): Promise<number> {
  if (currency === 'CAD') return 1;
  // Example static mapping; swap for real BoC rate lookup later.
  // You can even branch by date if you want.
  return 1.35; // 1 USD ~= 1.35 CAD (example)
}
