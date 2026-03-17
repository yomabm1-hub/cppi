import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import { User, Mail, Phone, Key, Shield, CheckCircle, XCircle, Wallet, Calendar, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setProfile(response.data.user)
      updateUser(response.data.user)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
          <User className="h-7 w-7 text-primary-400" />
          Profile
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300">Manage your account settings</p>
      </div>

      {/* Info strip - warm orange */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-orange-600/95 text-slate-900 shadow-xl p-4 sm:p-5 border border-amber-400/30">
        <p className="text-sm font-semibold text-slate-900/90 mb-1">Account settings</p>
        <p className="text-sm text-slate-800/90">
          Update your profile details and change your password. Your referral code is shown below for sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-400" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-primary-400" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-50 truncate">
                  {profile?.fullName || profile?.email || profile?.phone || 'User'}
                </p>
                <p className="text-sm text-slate-400 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(profile?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <User className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="text-sm font-medium text-slate-50">
                    {profile?.fullName || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-50">
                    {profile?.email || 'Not provided'}
                  </p>
                </div>
                {profile?.isEmailVerified ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-slate-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-50">
                    {profile?.phone || 'Not provided'}
                  </p>
                </div>
                {profile?.isPhoneVerified ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-slate-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <Key className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Referral Code</p>
                  <p className="text-sm font-semibold text-primary-400">
                    {profile?.referralCode || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-400" />
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {changingPassword ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Wallet Summary */}
        {profile?.wallet && (
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary-400" />
              Wallet Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Balance</p>
                <p className="text-xl font-bold text-emerald-400">
                  ${parseFloat(profile.wallet.balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Deposits</p>
                <p className="text-xl font-bold text-slate-50">
                  ${parseFloat(profile.wallet.totalDeposits || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Earnings</p>
                <p className="text-xl font-bold text-slate-50">
                  ${parseFloat(profile.wallet.totalEarnings || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Referral Bonuses</p>
                <p className="text-xl font-bold text-slate-50">
                  ${parseFloat(profile.wallet.totalReferralBonus || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Referrals Summary */}
        {profile?.referralCount !== undefined && (
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-50 mb-2 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary-400" />
              Referrals
            </h2>
            <p className="text-slate-400">
              You have referred <span className="font-semibold text-slate-50">{profile.referralCount}</span> users
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
