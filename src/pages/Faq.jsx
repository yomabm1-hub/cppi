import React from 'react'

export default function Faq() {
  const faqs = [
    {
      q: 'What is this platform?',
      a: 'This platform is a digital investment dashboard where you can deposit funds, subscribe to VIP levels, earn rewards, track transactions, and withdraw your balance.',
    },
    {
      q: 'How do deposits and withdrawals work?',
      a: 'You can deposit by following the instructions on the Deposits page, using the supported networks and currencies. Withdrawals are requested from your wallet balance and are processed by the admin team, possibly via on‑chain payouts.',
    },
    {
      q: 'How does the referral program work?',
      a: 'You can invite friends using your unique referral code or link. When your referrals deposit or earn, you may receive bonus rewards according to the current referral rules shown on the VIP/Referrals pages.',
    },
    {
      q: 'How is my data kept secure?',
      a: 'We use encryption, secure transport (HTTPS), and access controls to protect your account data. You should also use a strong password and never share your login details with anyone.',
    },
    {
      q: 'Who do I contact for support?',
      a: 'You can contact support via the in‑app chat (Support Chat) or by using any contact details provided in the app. For urgent issues, include as much detail as possible so we can help you faster.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950/95 py-8 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-50">Frequently Asked Questions</h1>
          <p className="text-sm text-slate-400">
            Quick answers to the most common questions about using this platform.
          </p>
        </header>

        <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4 text-sm text-slate-200 shadow-xl">
          {faqs.map((item, idx) => (
            <div
              key={item.q}
              className={`rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5 ${
                idx === 0 ? '' : 'mt-1'
              }`}
            >
              <h2 className="text-base font-semibold text-slate-50">{item.q}</h2>
              <p className="mt-2 text-sm text-slate-300 whitespace-pre-line">{item.a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

