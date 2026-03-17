import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home,
  CircleDollarSign,
  Receipt,
  Send,
  Gem,
  UserPlus,
  ListChecks,
  ArrowLeftRight,
  UserCircle,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
  UserCog,
  Banknote,
  Settings,
  Megaphone,
} from 'lucide-react'
import { useState } from 'react'
import FloatingChatButton from './FloatingChatButton'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Wallet', href: '/wallet', icon: CircleDollarSign },
    { name: 'Deposits', href: '/deposits', icon: Receipt },
    { name: 'Withdrawals', href: '/withdrawals', icon: Send },
    { name: 'VIP Levels', href: '/vip', icon: Gem },
    { name: 'Referrals', href: '/referrals', icon: UserPlus },
    { name: 'Tasks', href: '/tasks', icon: ListChecks },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'Support Chat', href: '/chat', icon: MessageSquare },
    ...(user?.isAdmin
      ? [
          {
            name: 'Admin Dashboard',
            href: '/admin',
            icon: Shield,
          },
          {
            name: 'Manage Users',
            href: '/admin/users',
            icon: UserCog,
          },
          {
            name: 'Manage Deposits',
            href: '/admin/deposits',
            icon: Receipt,
          },
          {
            name: 'Manage Withdrawals',
            href: '/admin/withdrawals',
            icon: Send,
          },
          {
            name: 'VIP Levels & Members',
            href: '/admin/vips',
            icon: Gem,
          },
          {
            name: 'Withdrawal Fees',
            href: '/admin/withdrawal-fees',
            icon: Banknote,
          },
          {
            name: 'System Settings',
            href: '/admin/system-settings',
            icon: Settings,
          },
          {
            name: 'Announcements',
            href: '/admin/announcements',
            icon: Megaphone,
          },
          {
            name: 'Support Chat',
            href: '/admin/chat',
            icon: MessageSquare,
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-3">
              <img src="/CP-Investment.png" alt="CP-Investment Logo" className="h-10 w-10 rounded-lg border border-primary-500/50 bg-slate-900 object-contain p-1" />
              <div>
                <p className="text-lg font-bold text-white leading-tight">CP-Investment</p>
                <p className="text-xs uppercase tracking-wide text-primary-300">Investment Hub</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-200 border border-primary-500/60'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-primary-300" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-50 truncate">
                  {user?.fullName || user?.email || user?.phone || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.referralCode}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
          <div className="relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-300 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            {/* Mobile app name - centered */}
            <div className="lg:hidden absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <img src="/CP-Investment.png" alt="CP-Investment Logo" className="h-8 w-8 rounded-lg bg-slate-900 border border-primary-500/50 object-contain p-1" />
              <p className="text-lg font-bold text-white">CP-Investment</p>
            </div>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center space-x-4">
              {user?.wallet && (
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <span className="text-slate-400">Balance:</span>
                  <span className="font-semibold text-slate-50">
                    ${parseFloat(user.wallet.balance || 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Floating Chat Button - Only for non-admin users */}
      <FloatingChatButton />
    </div>
  )
}

