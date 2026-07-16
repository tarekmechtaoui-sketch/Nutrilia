import { useState, useMemo } from 'react'
import { supabase } from './supabaseClient'
import { useLang } from './useLang'
import wilayas from '../WILAYA/Wilaya_Of_Algeria.json'
import communes from '../WILAYA/Commune_Of_Algeria.json'

const UNIT_PRICE = 4500 // DA per unit

const LANG_LABELS = { en: 'EN', fr: 'FR', ar: 'ع' }

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
  const { lang, setLang, t, isRtl } = useLang()
  const [form, setForm] = useState({ name: '', phone: '', wilaya: '', commune: '', quantity: 1, deliveryType: 'home' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const total = form.quantity * UNIT_PRICE

  const filteredCommunes = useMemo(() => {
    if (!form.wilaya) return []
    return communes.filter((c) => c.wilaya_id === form.wilaya)
  }, [form.wilaya])

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
      setErrorMsg(t('fillRequired'))
      return
    }
    setStatus('loading')
    setErrorMsg('')

    const { error } = await supabase.from('landingpages').insert({
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.commune && form.wilaya
        ? `${form.commune}, ${wilayas.find((w) => w.id === form.wilaya)?.name || ''}`
        : null,
      total,
      status: 'pending',
      delivery_type: form.deliveryType,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message || t('somethingWrong'))
      return
    }

    setStatus('success')
    setForm({ name: '', phone: '', wilaya: '', commune: '', quantity: 1, deliveryType: 'home' })
  }

  return (
    <div className={`min-h-screen overflow-x-hidden ${isRtl ? 'font-arabic' : ''}`}>
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-sand-light/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl italic tracking-tight text-ink">Sona</span>
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
              href="#order"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-sand-light transition hover:bg-ink/85"
            >
              {t('orderNow')}
            </a>
          </div>
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
              {t('sonicToothbrush')}
            </p>
            <h1 className="font-display text-5xl leading-[1.05] text-ink md:text-6xl">
              {t('heroTitle1')} <em className="italic text-mint-dark">{t('heroTitle2')}</em> {t('heroTitle3')}
            </h1>
            <p className="mt-5 max-w-md text-base text-ink/65 md:text-lg">
              {t('heroDesc')}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="#order"
                className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-sand-light shadow-lg shadow-ink/10 transition hover:-translate-y-0.5 hover:bg-ink/85"
              >
                {t('orderCta', { price: UNIT_PRICE.toLocaleString() })}
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
            { titleKey: 'feature1Title', descKey: 'feature1Desc' },
            { titleKey: 'feature2Title', descKey: 'feature2Desc' },
            { titleKey: 'feature3Title', descKey: 'feature3Desc' },
          ].map((f) => (
            <div key={f.titleKey} className="rounded-3xl bg-white/60 p-6">
              <h3 className="font-display text-xl text-ink">{t(f.titleKey)}</h3>
              <p className="mt-1.5 text-sm text-ink/60">{t(f.descKey)}</p>
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
            <h2 className="font-display text-3xl text-ink md:text-4xl">{t('reserveYours')}</h2>
            <p className="mt-2 text-sm text-ink/60">{t('cashOnDelivery')}</p>
          </div>

          {status === 'success' ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="font-display text-2xl text-mint-dark">{t('orderReceived')}</p>
              <p className="mt-2 text-sm text-ink/60">
                {t('orderSuccess')}
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
              >
                {t('placeAnother')}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-3xl bg-white p-8 shadow-sm shadow-ink/5"
            >
              <Field label={t('fullName')}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className="mt-1.5 w-full rounded-xl border border-ink/10 bg-sand-light/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-mint-dark"
                  required
                />
              </Field>

              <Field label={t('phone')}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="mt-1.5 w-full rounded-xl border border-ink/10 bg-sand-light/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-mint-dark"
                  required
                />
              </Field>

              <Field label={t('wilaya')}>
                <select
                  value={form.wilaya}
                  onChange={(e) => {
                    update('wilaya', e.target.value)
                    update('commune', '')
                  }}
                  className="mt-1.5 w-full rounded-xl border border-ink/10 bg-sand-light/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-mint-dark"
                  required
                >
                  <option value="">{t('selectWilaya')}</option>
                  {wilayas.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {lang === 'ar' ? w.ar_name : w.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t('commune')}>
                <select
                  value={form.commune}
                  onChange={(e) => update('commune', e.target.value)}
                  disabled={!form.wilaya}
                  className="mt-1.5 w-full rounded-xl border border-ink/10 bg-sand-light/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-mint-dark disabled:opacity-40"
                  required
                >
                  <option value="">{form.wilaya ? t('selectCommune') : t('pickWilaya')}</option>
                  {filteredCommunes.map((c) => (
                    <option key={c.id} value={lang === 'ar' ? c.ar_name : c.name}>
                      {lang === 'ar' ? c.ar_name : c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t('quantity')}>
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

              <Field label={t('deliveryType')}>
                <div className="mt-1.5 space-y-2">
                  {[
                    { value: 'home', labelKey: 'homeDelivery', subKey: 'homeDeliverySub' },
                    { value: 'desk', labelKey: 'officeDesk', subKey: 'officeDeskSub' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                        form.deliveryType === opt.value
                          ? 'border-mint-dark bg-mint-light/40'
                          : 'border-ink/10 bg-sand-light/40 hover:border-ink/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value={opt.value}
                        checked={form.deliveryType === opt.value}
                        onChange={() => update('deliveryType', opt.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                            form.deliveryType === opt.value
                              ? 'border-mint-dark'
                              : 'border-ink/20'
                          }`}
                        >
                          {form.deliveryType === opt.value && (
                            <div className="h-2 w-2 rounded-full bg-mint-dark" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-ink">{t(opt.labelKey)}</span>
                          <span className="ml-2 text-xs text-ink/40">{t(opt.subKey)}</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {t('free')}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="flex items-center justify-between border-t border-ink/10 pt-4">
                <span className="text-sm font-medium text-ink/60">{t('total')}</span>
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
                {status === 'loading' ? t('placingOrder') : t('confirmOrder')}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-ink/5 bg-sand-light px-6 py-8 text-center text-xs text-ink/40">
        {t('copyright', { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}
