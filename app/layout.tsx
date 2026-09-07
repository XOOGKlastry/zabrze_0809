import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin', 'latin-ext'] });
export const metadata: Metadata = { title:'Instalacje PV w Zabrzu — mapa', description:'Mobilna mapa planowanych instalacji fotowoltaicznych w Zabrzu.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pl"><body className={geist.variable}>{children}</body></html>}
