# 💎 Zenith Aura — GenZ Private Banking & Wealth Management Suite

![Zenith Aura Suite Banner](https://img.shields.io/badge/Zenith%20Aura-GenZ%20Private%20Banking-10B981?style=for-the-badge&logo=wallet)
![License](https://img.shields.io/badge/License-MIT-06B6D4?style=for-the-badge)
![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-8B5CF6?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-2FA%20MFA%20Step--Up-F43F5E?style=for-the-badge)

**Zenith Aura** is a full-stack, ultra-modern private banking and wealth management platform specifically engineered for GenZ digital natives and next-gen investors. It combines high-end private wealth management features with modern financial tools, gamified individual savings plans (ISP), simulated asset trading, and enterprise-grade security logic in **Indian Rupees (₹ INR)**.

---

## ✨ Core Features & Highlights

### 🛡️ 1. DOB Age Verification & Minor Protection
- **Automatic DOB Age Calculation**: Calculates age from Date of Birth (DOB) during onboarding.
- **Minor Protection Status (<18 Yrs)**: Restricts high-risk unbacked crypto assets, flags margin trading, and requires parental co-sign alerts for transfers exceeding ₹50,000.

### 🔐 2. Pre-Login & Step-Up Multi-Factor Authentication (MFA)
- **Pre-Login MFA Gate**: Authentication requires **Account Number** (e.g., `ZA-8849-2091`), **Password**, AND a **6-digit TOTP OTP Passcode** before granting access to the portfolio.
- **Transaction Step-Up Security**: High-value transfers ($\ge ₹50,000$) and trading orders ($\ge ₹1,00,000$) automatically prompt for 2FA verification.

### 🏦 3. GenZ Individual Savings Plan (ISP) & Vaults
- **High-Yield Compound Interest**: Vaults offering 6.75% to 7.50% APY.
- **Smart Purchase Round-Ups**: Automatically rounds up daily UPI purchases to stash micro-change into targeted goal vaults (*First Home*, *Tech Stash*, *Emergency Fund*).

### 📈 4. Simulated Wealth & Asset Trading Engine
- **Multi-Asset Trading**: Live price execution for Equities (NVDA, AAPL, TSLA), ETFs (VOO), and Digital Assets (BTC, ETH, SOL) in Indian Rupees (₹).
- **Portfolio Analytics**: Recharts area & donut graphs showing net worth growth and asset allocation.

---

## 🏗️ Technical Architecture

```
                                  +-------------------------------+
                                  |     Zenith Aura Frontend      |
                                  | React + Vite + Tailwind CSS   |
                                  | Recharts + Lucide Icons       |
                                  +---------------+---------------+
                                                  |
                                                  v (REST APIs)
                                  +---------------+---------------+
                                  |     Node.js Express Backend   |
                                  | JWT Auth | Pre-Login MFA Gate |
                                  | DOB Compliance | Ledger REST  |
                                  +---------------+---------------+
                                                  |
                                                  v
                                  +---------------+---------------+
                                  |      SQLite Database (DB)     |
                                  | Users, Vaults, Trades, Ledger |
                                  +-------------------------------+
```

---

## 📁 Repository Structure

```
Zenith-GenZ-Bank-PBWM/
├── client/                     # Vite + React Frontend Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar & live market ticker (INR)
│   │   │   ├── Dashboard.jsx   # Net worth area graph, accounts & ledger
│   │   │   ├── GenZSavings.jsx # Individual Savings Plan (ISP) vaults
│   │   │   ├── TradingHub.jsx  # Asset trading desk with age guardrails
│   │   │   ├── TransfersHub.jsx# UPI / NEFT / Wire transfer center
│   │   │   ├── SecurityKyc.jsx # DOB compliance & 2FA TOTP simulator
│   │   │   └── AuthModal.jsx   # 4-Step Onboarding Wizard & Pre-Login MFA
│   │   ├── App.jsx             # Main Application Shell & Landing Gateway
│   │   └── index.css           # Glassmorphism design tokens & scrollbars
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express API & SQLite Backend Server
│   ├── server.js               # REST endpoints for Auth, MFA, Banking & Trades
│   ├── db.js                   # SQLite database connection & auto-migration
│   └── package.json
├── README.md
└── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/santoshadkar/Zenith-GenZ-Bank-PBWM.git
cd Zenith-GenZ-Bank-PBWM
```

### 2. Install Dependencies
```bash
# Install Server Dependencies
cd server && npm install

# Install Client Dependencies
cd ../client && npm install
```

### 3. Start Application
```bash
# Terminal 1: Start Backend API (Port 5000)
cd server
npm start

# Terminal 2: Start Frontend Client (Port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173** to launch the Zenith Aura onboarding and banking gateway!

---

## 🔑 Demo Credentials

- **Demo Account Number**: `ZA-8849-2091`
- **Email**: `genz.investor@zenithaura.com`
- **Password**: `Zenith2026!`
- **2FA OTP Code**: Click **"Get 2FA OTP Code"** on the Pre-Login MFA Gate to generate the live 6-digit passcode.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
