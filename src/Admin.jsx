import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [filter, setFilter] = useState('all')

  async function fetchOrders() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('landingpages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setOrders(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  async function updateStatus(id, newStatus) {
    setUpdatingId(id)
    const { error } = await supabase
      .from('landingpages')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      )
    }
    setUpdatingId(null)
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-sand-light">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl italic tracking-tight text-ink">Sona</span>
            <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink/60">
              Admin
            </span>
          </div>
          <a
            href="/"
            className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
          >
            Back to site
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: 'Total', value: stats.total, color: 'text-ink' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-blue-600' },
            { label: 'Delivered', value: stats.delivered, color: 'text-green-600' },
            { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-ink/50">{s.label}</p>
              <p className={`font-display text-3xl ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === s
                  ? 'bg-ink text-sand-light'
                  : 'bg-white text-ink/60 hover:bg-ink/5'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button
            onClick={fetchOrders}
            className="ml-auto rounded-full border border-ink/15 px-4 py-1.5 text-sm font-medium text-ink/60 transition hover:bg-ink/5"
          >
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">
              dismiss
            </button>
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div className="py-20 text-center text-sm text-ink/40">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-ink/40">No orders found.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/5 text-xs font-medium uppercase tracking-wider text-ink/40">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Address</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-ink/5 last:border-0 transition hover:bg-ink/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {order.customer_name}
                    </td>
                    <td className="px-5 py-3.5 text-ink/70">{order.phone}</td>
                    <td className="max-w-[200px] truncate px-5 py-3.5 text-ink/50">
                      {order.address || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-ink">
                      {order.total?.toLocaleString()} DA
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-ink/50">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`cursor-pointer rounded-lg border-0 px-3 py-1.5 text-xs font-semibold outline-none transition disabled:opacity-50 ${
                          STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
