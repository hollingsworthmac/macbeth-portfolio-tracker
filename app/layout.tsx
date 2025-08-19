// app/layout.tsx
import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MacBeth Portfolio Tracker',
  description: 'Prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
          <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/">Dashboard</Link>
            <Link href="/accounts">Accounts</Link>
            <Link href="/transactions">Transactions</Link>
            <Link href="/holdings">Holdings</Link>
          </nav>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
        <footer style={{ padding: '12px 24px', borderTop: '1px solid #eee' }}>
          <small>© {new Date().getFullYear()} MacBeth Portfolio Tracker</small>
        </footer>
      </body>
    </html>
  );
}
