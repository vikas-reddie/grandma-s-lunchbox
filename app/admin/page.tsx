'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Booking {
  _id: string
  orderId: string
  userName: string
  mealType: string
  planType: string
  price: number
  paymentStatus: string
  bookingStatus: 'enrolled' | 'active' | 'paused' | 'cancelled' | 'expired'
  createdAt: string
}

interface Metrics {
  todaysMeals: number
  activeCustomers: number
  trialCustomers: number
  totalRevenue: number
  expiringBookings: number
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        let token = localStorage.getItem('authToken')

        if (!token) {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: 'admin',
              password: 'admin@123',
            }),
          })

          const loginData = await loginResponse.json()
          if (!loginResponse.ok) {
            throw new Error(loginData.error || 'Admin login failed')
          }

          if (typeof loginData.token !== 'string') {
            throw new Error('Admin token was not returned')
          }

          token = loginData.token
          localStorage.setItem('authToken', loginData.token)
        }

        if (!token) {
          throw new Error('Admin token was not returned')
        }

        const metricsResponse = await fetch('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setMetrics(metricsData.metrics)
        }

        let bookingsUrl = '/api/admin/bookings'
        const params = new URLSearchParams()
        if (query) params.append('search', query)
        if (selectedStatus) params.append('status', selectedStatus)
        if (selectedPaymentStatus) params.append('paymentStatus', selectedPaymentStatus)

        if (params.toString()) {
          bookingsUrl += '?' + params.toString()
        }

        const bookingsResponse = await fetch(bookingsUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData.bookings)
        } else if (bookingsResponse.status === 403) {
          setError('Admin access required')
        }
      } catch (err: any) {
        setError(err.message || 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query, selectedStatus, selectedPaymentStatus])

  const handleUpdateBooking = async (bookingId: string, newStatus: string, field: 'bookingStatus' | 'paymentStatus') => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const updateData = {
        bookingId,
        [field]: newStatus,
      }

      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedResponse = await fetch('/api/admin/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await updatedResponse.json()
        setBookings(data.bookings)
      }
    } catch (err) {
      console.error('Error updating booking:', err)
    }
  }

  if (loading) {
    return (
      <div className="admin-app">
        <p style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-app">
        <div style={{ maxWidth: '420px', margin: '100px auto', padding: '32px', textAlign: 'center', background: '#fffdf6', border: '1px solid #e7dec2', borderRadius: '16px' }}>
          <p className="eyebrow">Admin access</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Unable to load admin dashboard</h1>
          <p style={{ color: '#557064', lineHeight: 1.6 }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="admin-brand">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png"
            alt=""
          />
          <b>
            Grandma&apos;s<br />
            Lunchbox
          </b>
        </div>
        <p className="side-label">OPERATIONS</p>
        {[
          ['⌂', 'Dashboard', '/admin'],
          ['♙', 'Customers', '/admin/customers'],
          ['▣', 'Manage Orders', '/admin/orders'],
          ['☷', 'Menu', '/admin/menu'],
        ].map(([icon, label, href]) => (
          <Link className={label === 'Dashboard' ? 'active' : ''} href={href as string} key={label}>
            <span>{icon}</span>
            {label}
          </Link>
        ))}
        <div className="side-bottom">
          <span className="avatar">AD</span>
          <div>
            <b>Admin</b>
            <small>Dashboard</small>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top">
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h1>Good morning, Admin.</h1>
          </div>
          <div className="top-actions">
            <span className="mock-chip">Live Dashboard</span>
            <button className="icon-btn">⌕</button>
            <button className="icon-btn">♧</button>
          </div>
        </header>

        <div className="admin-content">
          {metrics && (
            <div className="metric-grid">
              {[
                ['Today\'s meals', metrics.todaysMeals.toString(), '↑ Bookings for today'],
                ['Active customers', metrics.activeCustomers.toString(), `${metrics.trialCustomers} on trial`],
                ['Monthly revenue', `₹${metrics.totalRevenue.toLocaleString()}`, '✓ Paid orders'],
                ['Expiring soon', metrics.expiringBookings.toString(), 'Needs attention'],
              ].map(([label, value, note]) => (
                <div className="metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </div>
              ))}
            </div>
          )}

          <div className="admin-section-head">
            <div>
              <p className="eyebrow">Live overview</p>
              <h2>Recent orders</h2>
            </div>
            <div className="table-actions">
              <input
                placeholder="Search orders"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '8px 12px', marginLeft: '10px' }}
              >
                <option value="">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                style={{ padding: '8px 12px', marginLeft: '10px' }}
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Meal</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.orderId}</td>
                    <td>{booking.userName}</td>
                    <td>{booking.planType === 'trial' ? '5-Day Trial' : 'Monthly'}</td>
                    <td>{booking.mealType === 'veg' ? '🥬 Veg' : '🍗 Non-Veg'}</td>
                    <td>₹{booking.price}</td>
                    <td>
                      <select
                        value={booking.paymentStatus}
                        onChange={(e) => handleUpdateBooking(booking._id, e.target.value, 'paymentStatus')}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={booking.bookingStatus}
                        onChange={(e) => handleUpdateBooking(booking._id, e.target.value, 'bookingStatus')}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <option value="active">Active</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>
                    <td>
                      <small style={{ color: '#666' }}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No bookings found
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
