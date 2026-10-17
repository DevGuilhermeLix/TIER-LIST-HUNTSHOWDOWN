import { Inter, Oswald } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

export const metadata = {
  title: 'Tier lists — Hunt: Showdown 1896',
  description: 'Armas e traits de Hunt: Showdown 1896 organizados por tier, e um guia com a fraqueza de cada boss.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${oswald.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
