'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { AppSettings, defaultSettings } from '@/lib/config/settings'

interface Delivery {
  deliveryId: string
  orderId: string
  userName: string
  userPhone: string
  pickupPoint: string
  mealType: 'veg' | 'non-veg'
  planType: 'trial' | 'monthly'
  price: number
  paymentStatus: 'pending' | 'paid'
  deliveryStatus: 'pending' | 'delivered'
  isFirstDay: boolean
}

function todayValue() {
  return new Date().toISOString().slice(0, 10)
}

async function getAdminToken() {
  let token = localStorage.getItem('authToken')
  if (token) return token

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin@123' }),
  })
  const data = await response.json()
  if (!response.ok || typeof data.token !== 'string') {
    throw new Error(data.error || 'Admin login failed')
  }
  token = data.token
  localStorage.setItem('authToken', data.token)
  return token
}

export default function ManageOrdersPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [date, setDate] = useState(todayValue)
  const [search, setSearch] = useState('')
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [qrData, setQrData] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  const loadDeliveries = async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getAdminToken()
      const response = await fetch(`/api/admin/deliveries?date=${encodeURIComponent(date)}&search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load deliveries')
      setDeliveries(data.deliveries)
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/settings').then(response => response.json()).then(setSettings).catch(() => undefined)
    const timer = window.setTimeout(loadDeliveries, 250)
    return () => window.clearTimeout(timer)
  }, [date, search])

  const openPayment = async (delivery: Delivery) => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(settings.payment.upiId)}&pn=${encodeURIComponent(settings.payment.payeeName)}&am=${encodeURIComponent(delivery.price)}&cu=INR`
    setQrData(await QRCode.toDataURL(upiUrl, { width: 260, margin: 2 }))
    setSelectedDelivery(delivery)
  }

  const updateDelivery = async (delivery: Delivery, action: 'paid' | 'delivered' | 'payment_not_received') => {
    setProcessingId(delivery.deliveryId)
    setError('')
    try {
      const token = await getAdminToken()
      const response = await fetch('/api/admin/deliveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryId: delivery.deliveryId, action }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to update delivery')

      if (action === 'payment_not_received') {
        setDeliveries(current => current.filter(item => item.deliveryId !== delivery.deliveryId))
        setSelectedDelivery(null)
        return
      }

      setDeliveries(current => current.map(item => item.deliveryId === delivery.deliveryId ? {
        ...item,
        paymentStatus: action === 'paid' ? 'paid' : item.paymentStatus,
        deliveryStatus: action === 'delivered' ? 'delivered' : item.deliveryStatus,
      } : item))
      setSelectedDelivery(null)
    } catch (updateError: any) {
      setError(updateError.message || 'Unable to update delivery')
    } finally {
      setProcessingId('')
    }
  }

  return (
    <div className="delivery-admin-shell">
      <button className="mobile-admin-menu" onClick={() => setMobileNavOpen(current => !current)} aria-expanded={mobileNavOpen} aria-controls="admin-sidebar">☰ <span>Menu</span></button>
      <aside id="admin-sidebar" className={`sidebar${mobileNavOpen ? ' mobile-open' : ''}`}>
        <div className="admin-brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png" alt="Grandma&apos;s Lunchbox logo" /><b>Grandma&apos;s<br />Lunchbox</b></div>
        <p className="side-label">OPERATIONS</p>
        {[
          ['⌂', 'Dashboard', '/admin'],
          ['♙', 'Customers', '/admin/customers'],
          ['▣', 'Manage Orders', '/admin/orders'],
          ['☷', 'Menu', '/admin/menu'],
          ['⚙', 'Settings', '/admin/settings'],
        ].map(([icon, label, href]) => <a className={href === '/admin/orders' ? 'active' : ''} href={href} key={label}><span>{icon}</span>{label}</a>)}
        <div className="side-bottom"><span className="avatar">AD</span><div><b>Admin</b><small>Dashboard</small></div></div>
      </aside>
      <main className="delivery-board-page">
      <div className="delivery-board-wrap">
        <header className="delivery-masthead">
          <div>
            <span className="delivery-stamp">Daily delivery board</span>
            <h1>Today&apos;s deliveries</h1>
            <p className="delivery-sub">Every active customer scheduled for the selected date.</p>
          </div>
          <div className="delivery-route-count">
            <strong>{deliveries.length}</strong>
            stops on today&apos;s route
          </div>
        </header>

        <div className="delivery-toolbar">
          <div className="delivery-field">
            <label htmlFor="delivery-date">Date</label>
            <input id="delivery-date" type="date" value={date} onChange={event => setDate(event.target.value)} />
          </div>
          <div className="delivery-field delivery-field-grow">
            <label htmlFor="delivery-search">Search</label>
            <input id="delivery-search" type="search" placeholder="Search name, phone, order or drop point" value={search} onChange={event => setSearch(event.target.value)} />
          </div>
        </div>

        <div className="delivery-notice">
          <span aria-hidden="true">!</span>
          Payment must be marked paid before delivery is confirmed.
        </div>

        {error && <p className="delivery-error">{error}</p>}
        {loading ? <p className="delivery-empty">Loading deliveries...</p> : deliveries.length === 0 ? <p className="delivery-empty">No active deliveries for this date.</p> : (
          <div className="delivery-board-grid">
            {deliveries.map(delivery => {
              const needsPayment = delivery.isFirstDay && delivery.paymentStatus !== 'paid'
              return (
                <article className="delivery-ticket" key={delivery.deliveryId}>
                  <div className="delivery-ticket-head">
                    <span className="delivery-order-id">{delivery.orderId}</span>
                    <span className={`delivery-status ${delivery.deliveryStatus === 'delivered' ? 'is-delivered' : ''}`}>
                      {delivery.deliveryStatus === 'delivered' ? 'Delivered' : 'Pending'}
                    </span>
                  </div>
                  <div className="delivery-perforation" />
                  <div className="delivery-ticket-body">
                    <h2 className="delivery-customer">{delivery.userName || 'Unnamed customer'}</h2>
                    <div className="delivery-details">
                      <div><div className="delivery-detail-label">Drop point</div><div className="delivery-detail-value">{delivery.pickupPoint || 'Not provided'}</div></div>
                      <div><div className="delivery-detail-label">Phone</div><div className="delivery-detail-value">{delivery.userPhone || 'No phone number'}</div></div>
                      <div className="delivery-detail-full"><div className="delivery-detail-label">Meal</div><div className="delivery-detail-value">{delivery.mealType === 'veg' ? 'Veg' : 'Non-Veg'} · {delivery.planType === 'trial' ? '5-Day Trial' : 'Monthly'}</div></div>
                    </div>
                    <div className="delivery-amount-row"><span>Amount {needsPayment ? 'due' : ''}</span><strong>₹{delivery.price}</strong></div>
                  </div>
                  <div className="delivery-ticket-actions">
                    <a className="delivery-call-button" href={`tel:${delivery.userPhone}`}>Call</a>
                    {needsPayment && <button className="delivery-pay-button" onClick={() => openPayment(delivery)}>Collect payment</button>}
                    {delivery.isFirstDay && delivery.paymentStatus === 'paid' && <span className="delivery-paid-label">Paid</span>}
                    {delivery.deliveryStatus !== 'delivered' && <button className="delivery-delivered-button" disabled={processingId === delivery.deliveryId || needsPayment} onClick={() => updateDelivery(delivery, 'delivered')}>Delivered</button>}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {selectedDelivery && <div className="delivery-modal-backdrop" role="dialog" aria-modal="true">
        <div className="delivery-payment-modal">
          <span className="delivery-stamp">Collect payment</span>
          <h2>{selectedDelivery.userName}</h2>
          <p>Scan to pay ₹{selectedDelivery.price}</p>
          {qrData && <img src={qrData} alt={`UPI QR code for ₹${selectedDelivery.price}`} />}
          <div className="delivery-modal-actions">
            <button className="delivery-delivered-button" onClick={() => updateDelivery(selectedDelivery, 'paid')}>Paid</button>
            <button className="delivery-reject-button" onClick={() => updateDelivery(selectedDelivery, 'payment_not_received')}>Payment not received</button>
          </div>
        </div>
      </div>}
      </main>
    </div>
  )
}
