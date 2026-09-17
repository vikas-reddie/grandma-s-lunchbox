'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppSettings, defaultSettings } from '@/lib/config/settings'

export default function OrderPage() {
  const router = useRouter()
  const [meal, setMeal] = useState('veg')
  const [plan, setPlan] = useState('trial')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [pickupPoint, setPickupPoint] = useState('')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  useEffect(() => {
    fetch('/api/settings').then(response => response.json()).then(setSettings).catch(() => undefined)
  }, [])

  const trialPrice = `₹${settings.plans.trialPrice.toLocaleString('en-IN')}`
  const monthlyPrice = `₹${settings.plans.monthlyPrice.toLocaleString('en-IN')}`
  const price = plan === 'trial' ? trialPrice : monthlyPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!fullName || !phone || !pickupPoint || !startDate) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('authToken')

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mealType: meal,
          planType: plan,
          name: fullName,
          phone,
          email,
          pickupPoint,
          startDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create booking')
        setLoading(false)
        return
      }

      setOrderId(data.booking.orderId)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="order-page">
        <header className="site-header">
          <Link href="/" className="brand order-brand">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png"
              alt="Grandma's Lunchbox logo"
            />
            <span>
              Grandma&apos;s<br />
              <b>Lunchbox</b>
            </span>
          </Link>
        </header>
        <div className="order-shell success-box">
          <span className="success-mark">✓</span>
          <p className="eyebrow">You&apos;re all set</p>
          <h1>Order received.</h1>
          <p>
            Your order <b>{orderId}</b> is confirmed. You&apos;ll pay {price} on the first day your lunch is delivered.
          </p>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            A confirmation email has been sent to your email address.
          </p>
          <Link className="button" href="/">
            Back home →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="order-page">
      <header className="site-header">
        <Link href="/" className="brand order-brand">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png"
            alt="Grandma's Lunchbox logo"
          />
          <span>
            Grandma&apos;s<br />
            <b>Lunchbox</b>
          </span>
        </Link>
        <Link href="/" className="text-link">
          ← Back home
        </Link>
      </header>

      <div className="order-shell">
        <form className="order-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '15px', backgroundColor: '#fee', color: '#c33', marginBottom: '20px', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <fieldset>
            <legend>
              01 <span>Choose your meal</span>
            </legend>
            <div className="choice-grid">
              <button
                type="button"
                className={meal === 'veg' ? 'choice selected' : 'choice'}
                onClick={() => setMeal('veg')}
              >
                <b>Veg</b>
                <small>Home-style vegetarian lunch</small>
              </button>
              <button
                type="button"
                className={meal === 'non-veg' ? 'choice selected' : 'choice'}
                onClick={() => setMeal('non-veg')}
              >
                <b>Non-Veg</b>
                <small>Home-style lunch with chicken</small>
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              02 <span>Choose your plan</span>
            </legend>
            <div className="choice-grid">
              <button
                type="button"
                className={plan === 'trial' ? 'choice selected' : 'choice'}
                onClick={() => setPlan('trial')}
              >
                  <b>{settings.delivery.trialDays}-Day Trial</b>
                <small>{trialPrice} on delivery</small>
              </button>
              <button
                type="button"
                className={plan === 'monthly' ? 'choice selected' : 'choice'}
                onClick={() => setPlan('monthly')}
              >
                  <b>Monthly Plan</b>
                <small>{monthlyPrice} per month</small>
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              02 <span>Your details</span>
            </legend>
            <div className="form-grid">
              <div className="form-group">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email <span style={{ fontSize: '12px', color: '#999' }}>(optional)</span></label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Pickup location</label>
                <select
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  required
                >
                  <option value="">Select pickup point</option>
                  {settings.pickupPoints.map(point => <option value={point} key={point}>{point}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '30px', borderTop: '1px solid #e0e0e0' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#999', marginBottom: '5px' }}>{meal === 'veg' ? '🥬 Veg' : '🍗 Non-Veg'} {plan === 'trial' ? '5-day trial' : 'Monthly'}</p>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#111' }}>{price}</h2>
            </div>
            <button type="submit" className="button" disabled={loading} style={{ padding: '12px 30px', fontSize: '16px' }}>
              {loading ? 'Processing...' : 'Review & continue →'}
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#999', marginTop: '15px', textAlign: 'center' }}>
            No payment today. Pay on your first delivery.
          </p>
        </form>
      </div>
    </main>
  )
}
