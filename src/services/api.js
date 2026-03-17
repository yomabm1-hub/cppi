import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://motoinvestment2.space/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
}

// Wallet API
export const walletAPI = {
  getStats: () => api.get('/wallet/stats'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getProjectedEarnings: (days) => api.get('/wallet/projected-earnings', { params: { days } }),
  withdrawEarnings: (amount) => api.post('/wallet/withdraw-earnings', { amount }),
  getCompanyAddresses: () => api.get('/wallet/company-addresses'),
}

// Deposit API
export const depositAPI = {
  create: (data) => api.post('/deposit/create', data),
  createUsdt: (data) => api.post('/deposit/usdt/create', data),
  getMyDeposits: (params) => api.get('/deposit/my-deposits', { params }),
  getCompanyAddresses: () => api.get('/deposit/company-addresses'),
  getUsdtAddresses: () => api.get('/deposit/usdt/addresses'),
  autoFillTransaction: (hash) => api.post('/deposit/auto-fill-transaction', { transactionHash: hash }),
  preVerify: (data) => api.post('/deposit/pre-verify', data),
  verify: (depositId) => api.post(`/deposit/${depositId}/verify`),
  getPendingCount: () => api.get('/deposit/pending-count'),
  getAutomaticDetectionStatus: () => api.get('/deposit/automatic-detection-status'),
}

// Withdrawal API
export const withdrawalAPI = {
  create: (data) => api.post('/withdrawal/request', data),
  getMyWithdrawals: (params) => api.get('/withdrawal/history', { params }),
  getConfig: () => api.get('/withdrawal/config'),
  previewFee: (amount) => api.post('/withdrawal/preview-fee', { amount }),
  getNetworkFees: (currency) => api.get(`/withdrawal/network-fees/${currency}`),
  getStats: () => api.get('/withdrawal/stats'),
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/toggle-status`),
  getUserEarnings: (userId, params) => api.get(`/admin/users/${userId}/daily-earnings`, { params }),
  getUserDetail: (userId) => api.get(`/admin/users/${userId}/detail`),
  getUserDeposits: (userId, params) => api.get(`/admin/users/${userId}/deposits`, { params }),
  getUserWithdrawals: (userId, params) => api.get(`/admin/users/${userId}/withdrawals`, { params }),
  getUserReferralTree: (userId, depth = 3) => api.get(`/admin/users/${userId}/referral-tree`, { params: { depth } }),
  assignVip: (payload) => api.post('/admin/users/assign-vip', payload),
  upgradeVip: (payload) => api.post('/admin/users/upgrade-vip', payload),
  getDeposits: (params) => api.get('/admin/deposits', { params }),
  getPendingDeposits: () => api.get('/admin/deposits/pending'),
  processDeposit: (depositId, data) => api.patch(`/admin/deposits/${depositId}/process`, data),
  getWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  getPendingWithdrawals: () => api.get('/admin/withdrawals/pending'),
  processWithdrawal: (withdrawalId, data) => api.patch(`/admin/withdrawals/${withdrawalId}/process`, data),
  getVipLevels: () => api.get('/admin/vip-levels'),
  createVipLevel: (data) => api.post('/admin/vip-levels', data),
  updateVipLevel: (levelId, data) => api.put(`/admin/vip-levels/${levelId}`, data),
  deleteVipLevel: (levelId) => api.delete(`/admin/vip-levels/${levelId}`),
  getVipMembers: (params) => api.get('/admin/vip-members', { params }),
  getWithdrawalFeeTiers: () => api.get('/admin/withdrawal-fee-tiers'),
  createWithdrawalFeeTier: (data) => api.post('/admin/withdrawal-fee-tiers', data),
  updateWithdrawalFeeTier: (tierId, data) => api.put(`/admin/withdrawal-fee-tiers/${tierId}`, data),
  deleteWithdrawalFeeTier: (tierId) => api.delete(`/admin/withdrawal-fee-tiers/${tierId}`),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (data) => api.patch('/admin/settings', data),
}

// VIP API
export const vipAPI = {
  getLevels: () => api.get('/vip/levels'),
  getPublicLevels: () => api.get('/vip/public/levels'),
  getStatus: () => api.get('/vip/status'),
  join: (vipLevelId) => api.post('/vip/join', { vipLevelId }),
  startEarning: () => api.post('/vip/start-earning'),
  getPublicReferralRates: () => api.get('/vip/public/referral-rates'),
}

// Referral API
export const referralAPI = {
  getStats: () => api.get('/referral/stats'),
  getHistory: (params) => api.get('/referral/history', { params }),
  getBonuses: (params) => api.get('/referral/bonuses', { params }),
  getTree: (depth) => api.get('/referral/tree', { params: { depth } }),
  validateCode: (code) => api.get(`/referral/validate/${code}`),
}

// Announcement API
export const announcementAPI = {
  getActive: () => api.get('/announcements'),
  markRead: (announcementId) => api.post(`/announcements/${announcementId}/read`),
  adminList: () => api.get('/announcements/admin'),
  adminCreate: (data) => api.post('/announcements/admin', data),
  adminUpdate: (announcementId, data) => api.patch(`/announcements/admin/${announcementId}`, data),
  adminArchive: (announcementId) => api.delete(`/announcements/admin/${announcementId}`),
}

// Tasks API
export const taskAPI = {
  getAvailable: () => api.get('/tasks/available'),
  startEarning: () => api.post('/tasks/start-earning'),
  getEarningStatus: () => api.get('/tasks/earning-status'),
  getHistory: () => api.get('/tasks/history'),
  getEarningHistory: () => api.get('/tasks/earning-history'),
}

// Members API (public)
export const membersAPI = {
  getPublic: (params) => api.get('/members/public', { params }),
  getStats: () => api.get('/members/stats'),
}

// Chat API
export const chatAPI = {
  getMyConversation: () => api.get('/chat/my-conversation'),
  sendMessage: (content) => api.post('/chat/send', { content }),
  adminGetConversations: () => api.get('/chat/admin/conversations'),
  adminGetConversation: (conversationId) => api.get(`/chat/admin/conversations/${conversationId}`),
  adminReply: (conversationId, content) => api.post(`/chat/admin/conversations/${conversationId}/reply`, { content }),
}

export default api

