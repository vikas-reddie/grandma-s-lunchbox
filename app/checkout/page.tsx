'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AppSettings, defaultSettings } from '@/lib/config/settings'

export default function Checkout() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  useEffect(() => { fetch('/api/settings').then(response => response.json()).then(setSettings).catch(() => undefined) }, [])
  const days = settings.delivery.days.join(' - ')
  return <main className="order-page"><header className="site-header"><Link href="/" className="brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png" alt="Grandma&apos;s Lunchbox logo" /><span>Grandma&apos;s<br /><b>Lunchbox</b></span></Link></header><div className="checkout-box"><p className="eyebrow">Order confirmation</p><h1>Reserve your lunches.</h1><div className="notice"><b>Pay on your first delivery</b><p>No payment is required today. Your selected plan will be collected on the first day your lunch is delivered.</p></div><div className="checkout-total"><span>Grandma&apos;s Lunchbox · {settings.delivery.trialDays}-day trial</span><strong>₹{settings.plans.trialPrice.toLocaleString('en-IN')} due on delivery</strong></div><p className="section-description">Delivery: {days}, {settings.delivery.time}</p><Link className="button full" href="/success">Confirm order</Link><Link className="text-link centered-link" href="/order">← Edit order</Link></div></main>
}
