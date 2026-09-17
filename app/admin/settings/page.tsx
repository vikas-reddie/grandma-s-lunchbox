'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AppSettings, defaultSettings } from '@/lib/config/settings'

const nav = [
  ['⌂', 'Dashboard', '/admin'],
  ['♙', 'Customers', '/admin/customers'],
  ['▣', 'Manage Orders', '/admin/orders'],
  ['☷', 'Menu', '/admin/menu'],
  ['⚙', 'Settings', '/admin/settings'],
]

async function getAdminToken() {
  return localStorage.getItem('authToken') || ''
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [newPickupPoint, setNewPickupPoint] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = await getAdminToken()
        const response = await fetch('/api/admin/settings', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load settings')
        setSettings(data)
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load settings')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const update = <K extends keyof AppSettings>(group: K, field: keyof AppSettings[K], value: string | number | string[]) => {
    setSettings(current => ({ ...current, [group]: { ...current[group], [field]: value } }))
  }

  const addPickupPoint = () => {
    const point = newPickupPoint.trim()
    if (!point || settings.pickupPoints.includes(point)) return
    setSettings(current => ({ ...current, pickupPoints: [...current.pickupPoints, point] }))
    setNewPickupPoint('')
  }

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const token = await getAdminToken()
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: token
          ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
          : { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to save settings')
      setSettings(data)
      setMessage('Settings saved. Customer pages will use the new values.')
    } catch (saveError: any) {
      setError(saveError.message || 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!message && !error) return
    const timer = window.setTimeout(() => {
      setMessage('')
      setError('')
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [message, error])

  if (loading) return <div className="admin-app"><p style={{ padding: '30px' }}>Loading settings...</p></div>

  return (
    <div className="admin-app">
      <button className="mobile-admin-menu" onClick={() => document.getElementById('admin-settings-sidebar')?.classList.toggle('mobile-open')} aria-label="Open admin menu">☰ <span>Menu</span></button>
      <aside id="admin-settings-sidebar" className="sidebar">
        <div className="admin-brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png" alt="Grandma&apos;s Lunchbox logo" /><b>Grandma&apos;s<br />Lunchbox</b></div>
        <p className="side-label">OPERATIONS</p>
        {nav.map(([icon, label, href]) => <Link className={href === '/admin/settings' ? 'active' : ''} href={href} key={label}><span>{icon}</span>{label}</Link>)}
        <div className="side-bottom"><span className="avatar">AD</span><div><b>Admin</b><small>Settings</small></div></div>
      </aside>
      <main className="admin-main">
        <header className="admin-top"><div><p className="eyebrow">Configuration</p><h1>Settings</h1></div><span className="mock-chip">Live settings</span></header>
        {(message || error) && (
          <div className={`toast ${error ? 'toast-error' : 'toast-success'}`} role="status" aria-live="polite">
            {message || error}
          </div>
        )}
        <form className="admin-content settings-page" onSubmit={saveSettings}>
          <div className="admin-section-head"><div><p className="eyebrow">Business controls</p><h2>Manage customer-facing details</h2><p className="section-description">Changes here update the order form, homepage, payment QR, and delivery board.</p></div><button className="button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button></div>

          <section className="settings-panel"><p className="eyebrow">Plans & Pricing</p><h2>Plan prices</h2><div className="settings-grid"><label>5-Day Trial price<input type="number" min="0" value={settings.plans.trialPrice} onChange={event => update('plans', 'trialPrice', Number(event.target.value))} /></label><label>Monthly Plan price<input type="number" min="0" value={settings.plans.monthlyPrice} onChange={event => update('plans', 'monthlyPrice', Number(event.target.value))} /></label></div></section>

          <section className="settings-panel"><p className="eyebrow">Pickup Points</p><h2>Available collection points</h2><div className="settings-points">{settings.pickupPoints.map((point, index) => <div className="settings-point" key={`${point}-${index}`}><input value={point} onChange={event => setSettings(current => ({ ...current, pickupPoints: current.pickupPoints.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} /><button type="button" onClick={() => setSettings(current => ({ ...current, pickupPoints: current.pickupPoints.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</button></div>)}</div><div className="settings-add-point"><input placeholder="Add pickup point" value={newPickupPoint} onChange={event => setNewPickupPoint(event.target.value)} /><button type="button" className="button small" onClick={addPickupPoint}>Add point</button></div></section>

          <section className="settings-panel"><p className="eyebrow">Location & Contact</p><h2>Public business details</h2><div className="settings-grid"><label>City<input value={settings.location.city} onChange={event => update('location', 'city', event.target.value)} /></label><label>State<input value={settings.location.state} onChange={event => update('location', 'state', event.target.value)} /></label><label className="settings-wide">Area description<input value={settings.location.areaDescription} onChange={event => update('location', 'areaDescription', event.target.value)} /></label><label>Contact name<input value={settings.contact.name} onChange={event => update('contact', 'name', event.target.value)} /></label><label>Phone<input value={settings.contact.phone} onChange={event => update('contact', 'phone', event.target.value)} /></label><label>WhatsApp<input value={settings.contact.whatsapp} onChange={event => update('contact', 'whatsapp', event.target.value)} /></label><label>Email<input type="email" value={settings.contact.email} onChange={event => update('contact', 'email', event.target.value)} /></label></div></section>

          <section className="settings-panel"><p className="eyebrow">Payment</p><h2>UPI collection details</h2><div className="settings-grid"><label>UPI ID<input value={settings.payment.upiId} onChange={event => update('payment', 'upiId', event.target.value)} /></label><label>Payee name<input value={settings.payment.payeeName} onChange={event => update('payment', 'payeeName', event.target.value)} /></label></div></section>

          <section className="settings-panel"><p className="eyebrow">Delivery Rules</p><h2>Delivery schedule</h2><div className="settings-grid"><label>Delivery time<input value={settings.delivery.time} onChange={event => update('delivery', 'time', event.target.value)} /></label><label>Trial duration in days<input type="number" min="1" value={settings.delivery.trialDays} onChange={event => update('delivery', 'trialDays', Number(event.target.value))} /></label><label>Monthly duration in days<input type="number" min="1" value={settings.delivery.monthlyDays} onChange={event => update('delivery', 'monthlyDays', Number(event.target.value))} /></label></div><div className="settings-days"><span>Delivery days</span>{days.map(day => <label key={day}><input type="checkbox" checked={settings.delivery.days.includes(day)} onChange={event => setSettings(current => ({ ...current, delivery: { ...current.delivery, days: event.target.checked ? [...current.delivery.days, day] : current.delivery.days.filter(item => item !== day) } }))} />{day}</label>)}</div></section>
        </form>
      </main>
    </div>
  )
}
