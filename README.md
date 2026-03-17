# CP-Investment - Frontend

A modern React frontend for the CP-Investment investment platform, built with Vite, React, and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 🔐 Authentication (Login/Register)
- 💰 Wallet management
- 📥 Deposits (Coinbase & USDT)
- 📤 Withdrawals
- 👑 VIP levels and earnings
- 👥 Referral system
- 📊 Transaction history
- ✅ Task system
- 👤 User profile management

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running (default: http://localhost:5000)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are set):
```bash
cp .env.example .env
```

4. Update `.env` with your backend API URL if needed:
```
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

Build the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx   # Main layout with sidebar
│   ├── contexts/        # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Wallet.jsx
│   │   ├── Deposits.jsx
│   │   ├── Withdrawals.jsx
│   │   ├── VIP.jsx
│   │   ├── Referrals.jsx
│   │   ├── Transactions.jsx
│   │   ├── Tasks.jsx
│   │   └── Profile.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend communicates with the backend API through the `api.js` service file. All API endpoints are configured to work with the backend routes:

- `/api/auth` - Authentication
- `/api/wallet` - Wallet operations
- `/api/deposit` - Deposits
- `/api/withdrawal` - Withdrawals
- `/api/vip` - VIP levels
- `/api/referral` - Referral system
- `/api/tasks` - Tasks
- `/api/members` - Public member data

## Features Overview

### Authentication
- User registration with email/phone
- Login with email or phone
- Password change functionality
- JWT token-based authentication

### Dashboard
- Wallet balance overview
- Quick stats (deposits, earnings, referrals)
- VIP status display
- Quick action buttons

### Wallet
- Balance display
- Transaction history
- Projected earnings
- Daily earnings tracking

### Deposits
- USDT deposit creation
- Transaction hash verification
- Auto-fill transaction details
- Deposit history
- Company wallet addresses

### Withdrawals
- Withdrawal request creation
- Multiple currency support (USDT, USDC, BTC)
- Network selection
- Withdrawal history

### VIP System
- View all VIP levels
- Join/upgrade VIP levels
- Start earning sessions
- View current VIP status

### Referrals
- Referral link and code
- Multi-level referral stats
- Referral history
- Commission rates display

### Transactions
- Complete transaction history
- Filter by transaction type
- Pagination support

### Tasks
- Available tasks display
- Start daily earning tasks
- Task history

### Profile
- User information display
- Password change
- Wallet summary
- Referral count

## Styling

The project uses Tailwind CSS for styling. Custom colors and components are defined in:
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Custom utility classes

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

