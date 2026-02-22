import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SWRProvider } from '@/components/providers/SWRProvider';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flux Market Overview',
  description: 'Professional-grade financial web application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-[240px]">
              <Header />
              <main className="pt-14 overflow-hidden h-screen bg-[var(--bg-base)]">
                {children}
              </main>
            </div>
          </div>
        </SWRProvider>
      </body>
    </html>
  );
}
