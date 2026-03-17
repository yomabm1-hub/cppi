import React from 'react'

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-950/95 py-8 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-50">Terms of Use</h1>
          <p className="text-sm text-slate-400">
            These Terms of Use govern your access to and use of our investment platform.
          </p>
        </header>

        <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4 text-sm text-slate-200 shadow-xl">
          <div>
            <h2 className="text-base font-semibold text-slate-100">1. Acceptance of terms</h2>
            <p className="mt-1 text-slate-300">
              By creating an account or using the platform, you agree to be bound by these Terms of
              Use and our Privacy Policy. If you do not agree, you must not use the service.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">
              2. Eligibility and account responsibility
            </h2>
            <p className="mt-1 text-slate-300">
              You are responsible for ensuring you are legally allowed to use this service in your
              jurisdiction. You agree to provide accurate information, keep your credentials secure,
              and immediately notify us of any unauthorized access to your account.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">3. Platform use</h2>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
              <li>Do not use the platform for illegal or fraudulent activities.</li>
              <li>Do not attempt to bypass security, reverse engineer, or abuse the system.</li>
              <li>
                You are responsible for all actions taken from your account, including deposits,
                withdrawals, and transactions.
              </li>
              <li>
                We may suspend or terminate accounts that violate these terms or pose security or
                compliance risks.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">4. Investment risk</h2>
            <p className="mt-1 text-slate-300">
              All investments carry risk. Past performance does not guarantee future results. You
              acknowledge that you may lose some or all of the funds you deposit and that we do not
              provide personal financial, tax, or legal advice.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">5. Limitation of liability</h2>
            <p className="mt-1 text-slate-300">
              To the maximum extent permitted by law, we are not liable for indirect, incidental, or
              consequential damages, loss of profits, or loss of data arising out of your use of the
              platform. Our total liability is limited to the amount of fees you have paid to us, if
              any, during the preceding 12 months.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">6. Changes and termination</h2>
            <p className="mt-1 text-slate-300">
              We may update these Terms or modify or discontinue parts of the service at any time.
              If we make material changes, we will notify you through the platform or by email. Your
              continued use of the platform after changes become effective means you accept the
              updated Terms.
            </p>
          </div>

          <p className="text-xs text-slate-500 pt-2">Last updated: {new Date().getFullYear()}</p>
        </section>
      </div>
    </div>
  )
}

