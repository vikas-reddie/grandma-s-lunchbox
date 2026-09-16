import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
export const metadata: Metadata = { title: "Grandma's Lunchbox | Home-cooked lunch at work", description: "Fresh home-style lunch delivered to offices in Sricity, Andhra Pradesh every weekday.", generator: 'Next.js' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#fff9e9', width: 'device-width', initialScale: 1 }
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}{process.env.NODE_ENV==='production'&&<Analytics/>}</body></html>}
