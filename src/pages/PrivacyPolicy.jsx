import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950/95 py-8 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-50">Privacy Policy</h1>
          <p className="text-sm text-slate-400">
            This Privacy Policy explains how we collect, use, and protect your information when you
            use our platform.
          </p>
        </header>

        <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4 text-sm text-slate-200 shadow-xl">
          <div>
            <h2 className="text-base font-semibold text-slate-100">1. Information we collect</h2>
            <p className="mt-1 text-slate-300">
              We collect the information you provide when you register, log in, deposit or withdraw
              funds, complete tasks, or contact support. This may include your name, email, phone
              number, wallet addresses, transaction data, referral information, and usage data such
              as IP address, device details, and log events.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">
              2. How we use your information
            </h2>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
              <li>To create and manage your account.</li>
              <li>To process deposits, withdrawals, rewards, and referrals.</li>
              <li>To secure the platform, detect fraud, and prevent abuse.</li>
              <li>To provide support and respond to your requests.</li>
              <li>To improve our features, performance, and user experience.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">
              3. How we share your information
            </h2>
            <p className="mt-1 text-slate-300">
              We do not sell your personal data. We may share limited information with trusted
              service providers (such as payment, security, and infrastructure providers) strictly
              to operate the platform, and only under appropriate confidentiality and data
              protection obligations. We may also share data if required by law or to protect our
              legal rights.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">4. Data security</h2>
            <p className="mt-1 text-slate-300">
              We use technical and organizational measures to protect your information, including
              encryption, access controls, and monitoring. However, no online service is completely
              risk‑free, and you are responsible for keeping your login credentials secure.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">5. Your rights</h2>
            <p className="mt-1 text-slate-300">
              Depending on your location, you may have rights to access, correct, or delete your
              personal data, restrict or object to certain processing, or request a copy of your
              data. You can contact support to exercise these rights, subject to legal and security
              requirements.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-100">
              6. Changes to this Privacy Policy
            </h2>
            <p className="mt-1 text-slate-300">
              We may update this Privacy Policy from time to time. When we do, we will update the
              &quot;last updated&quot; date and, where appropriate, notify you through the platform
              or by email.
            </p>
          </div>

          <p className="text-xs text-slate-500 pt-2">Last updated: {new Date().getFullYear()}</p>
        </section>
      </div>
    </div>
  )
}

