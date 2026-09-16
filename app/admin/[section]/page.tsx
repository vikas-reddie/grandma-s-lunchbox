'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

const nav = [
  ['⌂', 'Dashboard', '/admin'],
  ['♙', 'Customers', '/admin/customers'],
  ['☷', 'Menu', '/admin/menu'],
]

const menuItems = [
  { day: 'Monday', dish: 'Rice, Dal Curry, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
  { day: 'Tuesday', dish: 'Rice, Sambar, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
  { day: 'Wednesday', dish: 'Rice, Dal Curry, Paneer (Veg) / Chicken (Non-Veg), Curd, Pickle, Papad', side: '', type: 'Both' },
  { day: 'Thursday', dish: 'Rice, Sambar, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
  { day: 'Friday', dish: 'Rice, Dal Curry, Vegetable Fry, Curd, Pickle, Papad', side: '', type: 'Veg' },
]

const sections: Record<string, { eyebrow: string; title: string; description: string; stats: [string, string, string][] }> = {
  customers: {
    eyebrow: 'Customer management',
    title: 'Customers',
    description: 'Keep track of your subscribers, trial members, and delivery preferences.',
    stats: [['Active customers', '27', '4 on trial'], ['New this month', '8', '↑ 14% from August'], ['Churn rate', '2.1%', 'Healthy retention']],
  },
  menu: {
    eyebrow: 'Food planning',
    title: 'Menu',
    description: 'Edit the weekday lunch menu and keep meal options fresh for subscribers.',
    stats: [['This week&apos;s dishes', '5', 'One dish per weekday'], ['Veg dishes', '3', 'Popular with subscribers'], ['Next menu update', 'Friday', 'Review upcoming week']],
  },
}

export default function AdminSection() {
  const params = useParams<{ section: string }>()
  const section = sections[params.section] ?? sections.customers
  const [items, setItems] = useState(menuItems)
  const [saved, setSaved] = useState(false)

  const updateItem = (index: number, field: 'dish' | 'side' | 'type', value: string) => {
    setItems(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
    setSaved(false)
  }

  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="admin-brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png" alt="Grandma&apos;s Lunchbox logo" /><b>Grandma&apos;s<br />Lunchbox</b></div>
        <p className="side-label">OPERATIONS</p>
        {nav.map(([icon, label, href]) => <Link className={href === `/admin/${params.section}` ? 'active' : ''} href={href} key={label}><span>{icon}</span>{label}</Link>)}
        <div className="side-bottom"><span className="avatar">VR</span><div><b>Vikas Reddy</b><small>Owner · Mock auth</small></div></div>
      </aside>
      <main className="admin-main">
        <header className="admin-top"><div><p className="eyebrow">Tuesday, 15 September 2026</p><h1>{section.title}</h1></div><div className="top-actions"><span className="mock-chip">Development mode</span><button className="icon-btn" aria-label="Search">⌕</button><button className="icon-btn" aria-label="Notifications">♧</button></div></header>
        <div className="admin-content">
          <div className="admin-section-head"><div><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2><p className="section-description">{section.description}</p></div></div>
          <div className="metric-grid">{section.stats.map(([label, value, note]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div>
          {params.section === 'menu' ? <div className="admin-panel menu-editor"><div className="admin-section-head"><div><p className="eyebrow">Weekly menu</p><h2>Edit lunch offerings</h2><p className="section-description">Update dishes, sides, and meal type for each weekday.</p></div><button className="button small" onClick={() => setSaved(true)}>{saved ? 'Saved' : 'Save menu'}</button></div><div className="table-wrap"><table><thead><tr><th>Day</th><th>Main dish</th><th>Sides</th><th>Meal type</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.day}><td><strong>{item.day}</strong></td><td><input aria-label={`${item.day} main dish`} value={item.dish} onChange={event => updateItem(index, 'dish', event.target.value)} /></td><td><input aria-label={`${item.day} sides`} value={item.side} onChange={event => updateItem(index, 'side', event.target.value)} /></td><td><select aria-label={`${item.day} meal type`} value={item.type} onChange={event => updateItem(index, 'type', event.target.value)}><option>Veg</option><option>Non-Veg</option></select></td></tr>)}</tbody></table></div></div> : <div className="admin-panel"><div><p className="eyebrow">Customer list</p><h2>Subscriber overview</h2><p className="section-description">View active subscribers, trial members, and delivery preferences.</p></div><Link className="button small" href="/admin">Back to dashboard</Link></div>}
        </div>
      </main>
    </div>
  )
}
