import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useLang } from './useLang'

const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const LANG_LABELS = { en: 'EN', fr: 'FR', ar: 'ع' }

export default function Admin() {
  const { lang, setLang, t, isRtl } = useLang()
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
    <div className={`min-h-screen bg-sand-light ${isRtl ? 'font-arabic' : ''}`}>
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl italic tracking-tight text-ink">Sona</span>
            <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink/60">
              {t('admin')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-ink/10 bg-white/60 p-0.5">
              {['en', 'fr', 'ar'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    lang === l ? 'bg-ink text-sand-light' : 'text-ink/50 hover:text-ink'
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <a
              href="/"
              className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
            >
              {t('backToSite')}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { key: 'totalOrders', value: stats.total, color: 'text-ink' },
            { key: 'pending', value: stats.pending, color: 'text-yellow-600' },
            { key: 'confirmed', value: stats.confirmed, color: 'text-blue-600' },
            { key: 'delivered', value: stats.delivered, color: 'text-green-600' },
            { key: 'cancelled', value: stats.cancelled, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.key} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-ink/50">{t(s.key)}</p>
              <p className={`font-display text-3xl ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-ink text-sand-light'
                : 'bg-white text-ink/60 hover:bg-ink/5'
            }`}
          >
            {t('all')}
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === s
                  ? 'bg-ink text-sand-light'
                  : 'bg-white text-ink/60 hover:bg-ink/5'
              }`}
            >
              {t(s)}
            </button>
          ))}
          <button
            onClick={fetchOrders}
            className="ml-auto rounded-full border border-ink/15 px-4 py-1.5 text-sm font-medium text-ink/60 transition hover:bg-ink/5"
          >
            {t('refresh')}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">
              {t('dismiss')}
            </button>
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div className="py-20 text-center text-sm text-ink/40">{t('loadingOrders')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-ink/40">{t('noOrders')}</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/5 text-xs font-medium uppercase tracking-wider text-ink/40">
                  <th className="px-5 py-3">{t('customer')}</th>
                  <th className="px-5 py-3">{t('phoneLabel')}</th>
                  <th className="px-5 py-3">{t('address')}</th>
                  <th className="px-5 py-3">{t('delivery')}</th>
                  <th className="px-5 py-3 text-right">{t('totalOrders')}</th>
                  <th className="px-5 py-3">{t('date')}</th>
                  <th className="px-5 py-3">{t('status')}</th>
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
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {order.delivery_type === 'desk' ? t('officeDesk') : t('homeDelivery')} · {t('free')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-ink">
                      {order.total?.toLocaleString()} DA
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-ink/50">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-GB', {
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
                            {t(s)}
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
