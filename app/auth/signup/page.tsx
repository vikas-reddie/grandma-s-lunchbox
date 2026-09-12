'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      // Store token
      localStorage.setItem('authToken', data.token)
      setSubmitted(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/order')
      }, 2000)
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
          <p className="eyebrow">Welcome!</p>
          <h1>Account created.</h1>
          <p>Your account has been created successfully. Redirecting you to the order page...</p>
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
        <div className="order-intro">
          <p className="eyebrow">Join us</p>
          <h1>
            Create your<br />
            <em>account.</em>
          </h1>
          <p>Sign up to start your lunch journey with Grandma's Lunchbox.</p>
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '15px', backgroundColor: '#fee', color: '#c33', marginBottom: '20px', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <fieldset>
            <legend>
              01 <span>Personal information</span>
            </legend>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>
              02 <span>Create password</span>
            </legend>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </fieldset>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account & continue'}
          </button>

          <p style={{ fontSize: '14px', color: '#666', marginTop: '15px', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#f0ad4e', textDecoration: 'none', fontWeight: 'bold' }}>
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
