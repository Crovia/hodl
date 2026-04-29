import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCryImages from '@/components/FloatingCryImages';
import SunsetBanner from '@/components/SunsetBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DiamondHands | The Strongest Survive',
  description: 'Who resists selling first? Every jeeter funds the next Diamond Hands payday.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 6}s`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: ['#fbbf24', '#36bffa', '#a855f7', '#fff'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <SunsetBanner />
          <main className="relative flex-1 bg-luxury-black">
            <FloatingCryImages count={5} />
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
