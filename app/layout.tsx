import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '🌍 3D Multi-Agent Societal Simulator',
  description: 'An interactive 3D simulation where 15 AI-powered personas react to real-world news events in a stylized village. Built with Next.js, Three.js, and AI.',
  keywords: ['3D simulation', 'multi-agent', 'AI', 'Next.js', 'Three.js', 'society'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#0a0a1a' }}>
        {children}
      </body>
    </html>
  );
}
