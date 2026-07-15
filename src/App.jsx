import { useState } from 'react'
import { supabase } from './supabaseClient'

const UNIT_PRICE = 4500 // DA per unit

function Toothbrush({ tone = 'mint', className = '' }) {
  const colors =
    tone === 'mint'
      ? { body: '#9FE0C9', dark: '#4FAE8E', bristle: '#F4F8F6' }
      : { body: '#F6C2CD', dark: '#EE96A8', bristle: '#FDF6F7' }

  return (
    <svg viewBox="0 0 120 320" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="70" width="36" height="220" rx="18" fill={colors.body} />
      <rect x="42" y="70" width="36" height="70" rx="18" fill={colors.dark} opacity="0.25" />
      <circle cx="60" cy="55" r="6" fill="#fff" opacity="0.85" />
      <rect x="38" y="18" width="44" height="46" rx="16" fill="#E7ECEA" />
      <g>
        {[-14, -7, 0, 7, 14].map((dx) => (
          <circle key={dx} cx={60 + dx} cy={26} r="6" fill={colors.bristle} stroke="#D9DEDC" strokeWidth="1" />
        ))}
        {[-10.5, -3.5, 3.5, 10.5].map((dx) => (
          <circle key={dx} cx={60 + dx} cy={38} r="6" fill={colors.bristle} stroke="#D9DEDC" strokeWidth="1" />
        ))}
      </g>
    </svg>
  )
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  )
}

export default function App() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', quantity: 1 })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const total = form.quantity * UNIT_PRICE

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function adjustQty(delta) {
    setForm((f) => ({ ...f, quantity: Math.min(10, Math.max(1, f.quantity + delta)) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus('error')
      setErrorMsg('Please fill in your name and phone number.')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    const { error } = await supabase.from('landingpages').insert({
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      total,
      status: 'pending',
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message || 'Something went wrong. Please try again.')
      return
    }

    setStatus('success')
    setForm({ name: '', phone: '', address: '', quantity: 1 })
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-sand-light/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl italic tracking-tight text-ink">Sona</span>
          <a
            href="#order"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-sand-light transition hover:bg-ink/85"
          >
            Order now
          </a>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative isolate overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #CFF1E4 0%, #F2E4C9 52%, #FBDFE5 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-24 top-16 h-[420px] w-[420px] rounded-full opacity-70 blur-3xl md:h-[520px] md:w-[520px]"
          style={{ background: 'radial-gradient(circle, #F0A99C 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-14 md:grid-cols-2 md:pb-24 md:pt-20">
          <div className="relative z-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">
              Sonic toothbrush
            </p>
            <h1 className="font-display text-5xl leading-[1.05] text-ink md:text-6xl">
              A gentler <em className="italic text-mint-dark">kind</em> of clean.
            </h1>
            <p className="mt-5 max-w-md text-base text-ink/65 md:text-lg">
              Soft sonic vibrations, two color ways, one charge that lasts for weeks.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="#order"
                className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-sand-light shadow-lg shadow-ink/10 transition hover:-translate-y-0.5 hover:bg-ink/85"
              >
                Order now — {UNIT_PRICE.toLocaleString()} DA
              </a>
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-center gap-6 md:gap-10">
            <Toothbrush tone="blush" className="h-64 w-auto md:h-80" />
            <Toothbrush tone="mint" className="h-80 w-auto translate-y-4 md:h-[26rem]" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { title: 'Sonic clean', desc: '40,000 gentle strokes a minute.' },
            { title: '30-day battery', desc: 'One charge, weeks of use.' },
            { title: 'Soft-touch heads', desc: 'Kind to gums, tough on plaque.' },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-white/60 p-6">
              <h3 className="font-display text-xl text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ORDER FORM */}
      <section id="order" className="relative px-6 py-16 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(180deg, #FAF3E3 0%, #CFF1E4 100%)' }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">Reserve yours</h2>
            <p className="mt-2 text-sm text-ink/60">Cash on delivery. We'll call to confirm.</p>
          </div>

          {status === 'success' ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="font-display text-2xl text-mint-dark">Order received</p>
              <p className="mt-2 text-sm text-ink/60">
                Thanks — we'll reach out shortly to confirm delivery.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
              >
                Place another order
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-3xl bg-white p-8 shadow-sm shadow-ink/5"
            >
              <Field label="Full name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Jane Doe"
                  className="mt-1.5 w-full rounded-xl border border-ink/10 bg-sand-light/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-mint-dark"
                  required
                />
              </Field>

              <Field label="Phone number">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="0555 12 34 56"
                  className="mt-1.5 w-full rounded-xl border border-ink/10 bg-sand-light/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-mint-dark"
                  required
                />
              </Field>

              <Field label="Delivery address">
                <textarea
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder="Street, city, wilaya"
                  rows={2}
                  className="mt-1.5 w-full resize-none rounded-xl border border-ink/10 bg-sand-light/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-mint-dark"
                />
              </Field>

              <Field label="Quantity">
                <div className="mt-1.5 flex w-fit items-center rounded-xl border border-ink/10 bg-sand-light/40">
                  <button
                    type="button"
                    onClick={() => adjustQty(-1)}
                    className="px-4 py-3 text-lg text-ink/60 transition hover:text-ink"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-ink">
                    {form.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustQty(1)}
                    className="px-4 py-3 text-lg text-ink/60 transition hover:text-ink"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between border-t border-ink/10 pt-4">
                <span className="text-sm font-medium text-ink/60">Total</span>
                <span className="font-display text-2xl text-ink">
                  {total.toLocaleString()} DA
                </span>
              </div>

              {status === 'error' && (
                <p role="alert" className="text-sm font-medium text-coral">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-sand-light transition hover:bg-ink/85 disabled:opacity-50"
              >
                {status === 'loading' ? 'Placing order…' : 'Confirm order'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-ink/5 bg-sand-light px-6 py-8 text-center text-xs text-ink/40">
        © {new Date().getFullYear()} Sona. All rights reserved.
      </footer>
    </div>
  )
}
