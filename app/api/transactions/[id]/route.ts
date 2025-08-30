import { NextResponse } from "next/server";

// Temporary in-memory data
const transactions = [
  { id: "1", type: "buy", asset: "BTC", amount: 0.5 },
  { id: "2", type: "sell", asset: "ETH", amount: 2 },
];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const transaction = transactions.find((t) => t.id === params.id);

  if (!transaction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(transaction);
}
