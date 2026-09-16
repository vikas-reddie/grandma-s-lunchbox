'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const nav = [
  ['⌂', 'Dashboard', '/admin'],
  ['♙', 'Customers', '/admin/customers'],
  ['▣', 'Manage Orders', '/admin/orders'],
  ['☷', 'Menu', '/admin/menu'],
]

const menuItems = [
  { day: 'Monday', dish: 'Rice, Dal Curry, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
  { day: 'Tuesday', dish: 'Rice, Sambar, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
  { day: 'Wednesday', dish: 'Rice, Dal Curry, Paneer (Veg) / Chicken (Non-Veg), Curd, Pickle, Papad', side: '', type: 'Both' },
  { day: 'Thursday', dish: 'Rice, Sambar, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
  { day: 'Friday', dish: 'Rice, Dal Curry, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
]

interface Customer {
  _id: string
  orderId: string
  userName: string
  userPhone: string
  mealType: 'veg' | 'non-veg'
  planType: 'trial' | 'monthly'
  price: number
  createdAt: string
}

interface CustomerMetrics {
  enrolledCount: number
  activeCount: number
  newThisMonth: number
}

const sections: Record<string, { eyebrow: string; title: string; description: string }> = {
  customers: {
    eyebrow: 'Customer management',
    title: 'Customers',
    description: 'Review new registrations and confirm each customer after your phone call.',
  },
  menu: {
    eyebrow: 'Food planning',
    title: 'Menu',
    description: 'Edit the weekday lunch menu and keep meal options fresh for subscribers.',
  },
}

export default function AdminSection() {
  const params = useParams<{ section: string }>()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const sectionKey = params.section === 'menu' ? 'menu' : 'customers'
  const section = sections[sectionKey]
  const [items, setItems] = useState(menuItems)
  const [saved, setSaved] = useState(false)
  const [enrolledCustomers, setEnrolledCustomers] = useState<Customer[]>([])
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([])
  const [activeTab, setActiveTab] = useState<'enrolled' | 'active'>('enrolled')
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null)
  const [loading, setLoading] = useState(sectionKey === 'customers')
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState('')

  useEffect(() => {
    if (sectionKey !== 'customers') return

    const loadCustomers = async () => {
      try {
        let token = localStorage.getItem('authToken')
        if (!token) {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin@123' }),
          })
          const loginData = await loginResponse.json()
          if (!loginResponse.ok || typeof loginData.token !== 'string') {
            throw new Error(loginData.error || 'Admin login failed')
          }
          token = loginData.token
          localStorage.setItem('authToken', loginData.token)
        }

        const response = await fetch('/api/admin/customers', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load customers')

        setEnrolledCustomers(data.enrolledCustomers)
        setActiveCustomers(data.activeCustomers)
        setMetrics(data.metrics)
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load customers')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [sectionKey])

  const updateItem = (index: number, field: 'dish' | 'side' | 'type', value: string) => {
    setItems(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
    setSaved(false)
  }

  const handleCustomerAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    setProcessingId(bookingId)
    setError('')
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, action }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to update customer')

      setEnrolledCustomers(current => current.filter(customer => customer._id !== bookingId))
      if (action === 'confirm') {
        setActiveCustomers(current => [data.booking, ...current])
      }
      setMetrics(current => current ? {
        ...current,
        enrolledCount: Math.max(0, current.enrolledCount - 1),
        activeCount: action === 'confirm' ? current.activeCount + 1 : current.activeCount,
      } : current)
    } catch (actionError: any) {
      setError(actionError.message || 'Unable to update customer')
    } finally {
      setProcessingId('')
    }
  }

  const visibleCustomers = activeTab === 'enrolled' ? enrolledCustomers : activeCustomers

  return (
    <div className="admin-app">
      <button className="mobile-admin-menu" onClick={() => setMobileNavOpen(current => !current)} aria-expanded={mobileNavOpen} aria-controls="admin-sidebar">☰ <span>Menu</span></button>
      <aside id="admin-sidebar" className={`sidebar${mobileNavOpen ? ' mobile-open' : ''}`}>
        <div className="admin-brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png" alt="Grandma&apos;s Lunchbox logo" /><b>Grandma&apos;s<br />Lunchbox</b></div>
        <p className="side-label">OPERATIONS</p>
        {nav.map(([icon, label, href]) => <Link className={href === `/admin/${params.section}` ? 'active' : ''} href={href} key={label}><span>{icon}</span>{label}</Link>)}
        <div className="side-bottom"><span className="avatar">AD</span><div><b>Admin</b><small>Dashboard</small></div></div>
      </aside>
      <main className="admin-main">
        <header className="admin-top"><div><p className="eyebrow">Thursday, 17 September 2026</p><h1>{section.title}</h1></div><div className="top-actions"><span className="mock-chip">Live dashboard</span><button className="icon-btn" aria-label="Search">⌕</button><button className="icon-btn" aria-label="Notifications">♧</button></div></header>
        <div className="admin-content">
          <div className="admin-section-head"><div><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2><p className="section-description">{section.description}</p></div></div>
          {sectionKey === 'customers' ? (
            loading ? <p>Loading customers...</p> : error && enrolledCustomers.length === 0 && activeCustomers.length === 0 ? <p className="section-description">{error}</p> : (
              <>
                {metrics && <div className="metric-grid">
                  <div className="metric"><span>Enrolled customers</span><strong>{metrics.enrolledCount}</strong><small>Awaiting phone confirmation</small></div>
                  <div className="metric"><span>Active customers</span><strong>{metrics.activeCount}</strong><small>Confirmed customers</small></div>
                  <div className="metric"><span>New this month</span><strong>{metrics.newThisMonth}</strong><small>New enrolled registrations</small></div>
                </div>}
                {error && <p className="section-description">{error}</p>}
                <div className="admin-panel">
                  <div className="admin-section-head"><div><p className="eyebrow">Customer lists</p><h2>{activeTab === 'enrolled' ? 'Registration follow-up' : 'Active customers'}</h2><p className="section-description">{activeTab === 'enrolled' ? 'Call each person, then confirm or reject their registration.' : 'Customers confirmed and ready for lunch service.'}</p></div></div>
                  <div role="tablist" aria-label="Customer status" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e7dec2' }}>
                    <button role="tab" aria-selected={activeTab === 'enrolled'} onClick={() => setActiveTab('enrolled')} style={{ border: 0, borderBottom: activeTab === 'enrolled' ? '3px solid #a83216' : '3px solid transparent', background: 'transparent', padding: '10px 14px', fontWeight: 700, color: activeTab === 'enrolled' ? '#a83216' : '#557064', cursor: 'pointer' }}>Enrolled ({metrics?.enrolledCount ?? 0})</button>
                    <button role="tab" aria-selected={activeTab === 'active'} onClick={() => setActiveTab('active')} style={{ border: 0, borderBottom: activeTab === 'active' ? '3px solid #a83216' : '3px solid transparent', background: 'transparent', padding: '10px 14px', fontWeight: 700, color: activeTab === 'active' ? '#a83216' : '#557064', cursor: 'pointer' }}>Active ({metrics?.activeCount ?? 0})</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Customer</th><th>Phone</th><th>Plan</th><th>Meal</th><th>Registered</th>{activeTab === 'enrolled' && <th>Action</th>}</tr></thead>
                      <tbody>
                        {visibleCustomers.map(customer => <tr key={customer._id}>
                          <td><strong>{customer.userName || 'Unnamed customer'}</strong><br /><small>{customer.orderId}</small></td>
                          <td>{customer.userPhone || 'No phone number'}</td>
                          <td>{customer.planType === 'trial' ? '5-Day Trial' : 'Monthly'}<br /><small>₹{customer.price}</small></td>
                          <td>{customer.mealType === 'veg' ? 'Veg' : 'Non-Veg'}</td>
                          <td>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                          {activeTab === 'enrolled' && <td><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button className="button small" disabled={processingId === customer._id} onClick={() => handleCustomerAction(customer._id, 'confirm')}>Confirm</button>
                            <button className="button small" disabled={processingId === customer._id} onClick={() => handleCustomerAction(customer._id, 'reject')} style={{ background: '#a83216' }}>Reject</button>
                          </div></td>}
                        </tr>)}
                      </tbody>
                    </table>
                    {visibleCustomers.length === 0 && <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>{activeTab === 'enrolled' ? 'No enrolled customers waiting for confirmation.' : 'No active customers yet.'}</p>}
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <div className="metric-grid"><div className="metric"><span>This week&apos;s dishes</span><strong>5</strong><small>One dish per weekday</small></div><div className="metric"><span>Veg dishes</span><strong>3</strong><small>Popular with subscribers</small></div><div className="metric"><span>Next menu update</span><strong>Friday</strong><small>Review upcoming week</small></div></div>
              <div className="admin-panel menu-editor"><div className="admin-section-head"><div><p className="eyebrow">Weekly menu</p><h2>Edit lunch offerings</h2><p className="section-description">Update dishes, sides, and meal type for each weekday.</p></div><button className="button small" onClick={() => setSaved(true)}>{saved ? 'Saved' : 'Save menu'}</button></div><div className="table-wrap"><table><thead><tr><th>Day</th><th>Main dish</th><th>Sides</th><th>Meal type</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.day}><td><strong>{item.day}</strong></td><td><input aria-label={`${item.day} main dish`} value={item.dish} onChange={event => updateItem(index, 'dish', event.target.value)} /></td><td><input aria-label={`${item.day} sides`} value={item.side} onChange={event => updateItem(index, 'side', event.target.value)} /></td><td><select aria-label={`${item.day} meal type`} value={item.type} onChange={event => updateItem(index, 'type', event.target.value)}><option>Veg</option><option>Non-Veg</option></select></td></tr>)}</tbody></table></div></div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
