'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store token
      localStorage.setItem('authToken', data.token)

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/order')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
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
        <div className="order-intro">
          <p className="eyebrow">Welcome back</p>
          <h1>
            Log in to your<br />
            <em>account.</em>
          </h1>
          <p>Sign in to access your orders and bookings.</p>
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '15px', backgroundColor: '#fee', color: '#c33', marginBottom: '20px', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <fieldset>
              <legend>
                01 <span>Username & Password</span>
            </legend>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </fieldset>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p style={{ fontSize: '14px', color: '#666', marginTop: '15px', textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#f0ad4e', textDecoration: 'none', fontWeight: 'bold' }}>
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
