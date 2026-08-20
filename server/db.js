const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'aura_wealth.db');
const db = new sqlite3.Database(dbPath);

// Helper function to calculate age from DOB string (YYYY-MM-DD)
function calculateAge(dobString) {
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Promisify database queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDB() {
  db.serialize(async () => {
    console.log('[DB] Initializing SQLite tables...');

    // 1. Users Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        account_number TEXT UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        dob TEXT NOT NULL,
        age INTEGER NOT NULL,
        is_minor INTEGER NOT NULL DEFAULT 0,
        kyc_status TEXT NOT NULL DEFAULT 'Verified',
        mfa_enabled INTEGER NOT NULL DEFAULT 1,
        mfa_secret TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Auto-Migration: Ensure account_number column exists
    try {
      await runQuery(`ALTER TABLE users ADD COLUMN account_number TEXT`);
    } catch (e) {}

    await runQuery(`UPDATE users SET account_number = 'ZA-8849-2091' WHERE account_number IS NULL OR account_number = ''`);

    // 2. Accounts Table (Currency DEFAULT 'INR')
    await runQuery(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_number TEXT UNIQUE NOT NULL,
        account_type TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0.0,
        currency TEXT NOT NULL DEFAULT 'INR',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Update existing database currency to INR
    await runQuery(`UPDATE accounts SET currency = 'INR' WHERE currency = 'USD'`);

    // 3. GenZ Individual Savings Plans (ISP) & Vaults
    await runQuery(`
      CREATE TABLE IF NOT EXISTS savings_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL NOT NULL DEFAULT 0.0,
        apy REAL NOT NULL DEFAULT 6.75,
        category TEXT NOT NULL,
        auto_roundup INTEGER NOT NULL DEFAULT 1,
        monthly_contribution REAL NOT NULL DEFAULT 2500.0,
        target_date TEXT,
        status TEXT NOT NULL DEFAULT 'Active',
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // 4. Portfolio Holdings Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        quantity REAL NOT NULL,
        avg_buy_price REAL NOT NULL,
        current_price REAL NOT NULL,
        category TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // 5. Transactions Ledger
    await runQuery(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Completed',
        category TEXT NOT NULL,
        step_up_mfa_verified INTEGER NOT NULL DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // 6. Trades History
    await runQuery(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL,
        shares REAL NOT NULL,
        price REAL NOT NULL,
        total_amount REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Reset default seed data in INR amounts if old USD values exist
    const demoUser = await getQuery(`SELECT * FROM users WHERE email = ?`, ['genz.investor@zenithaura.com']);
    if (demoUser) {
      // Update balances to realistic INR amounts
      await runQuery(`UPDATE accounts SET balance = 245000.00 WHERE id = 'acc_cash_01'`);
      await runQuery(`UPDATE accounts SET balance = 1825000.00 WHERE id = 'acc_wealth_02'`);
      await runQuery(`UPDATE accounts SET balance = 348000.00 WHERE id = 'acc_isp_03'`);

      // Update savings plans target & current in INR
      await runQuery(`UPDATE savings_plans SET target_amount = 500000.00, current_amount = 224000.00 WHERE id = 'sp_01'`);
      await runQuery(`UPDATE savings_plans SET target_amount = 150000.00, current_amount = 89000.00 WHERE id = 'sp_02'`);
      await runQuery(`UPDATE savings_plans SET target_amount = 100000.00, current_amount = 35000.00 WHERE id = 'sp_03'`);

      // Update portfolios in INR
      await runQuery(`UPDATE portfolios SET avg_buy_price = 9200.00, current_price = 11200.00 WHERE symbol = 'NVDA'`);
      await runQuery(`UPDATE portfolios SET avg_buy_price = 14500.00, current_price = 18700.00 WHERE symbol = 'AAPL'`);
      await runQuery(`UPDATE portfolios SET avg_buy_price = 4000000.00, current_price = 5350000.00 WHERE symbol = 'BTC'`);
      await runQuery(`UPDATE portfolios SET avg_buy_price = 200000.00, current_price = 287500.00 WHERE symbol = 'ETH'`);
      await runQuery(`UPDATE portfolios SET avg_buy_price = 34000.00, current_price = 42700.00 WHERE symbol = 'VOO'`);
    } else {
      console.log('[DB] Seeding default Zenith Aura demo user in INR...');
      const userId = 'usr_genz_001';
      const accountNumber = 'ZA-8849-2091';
      const passwordHash = await bcrypt.hash('Zenith2026!', 10);
      const dob = '2003-04-14';
      const age = calculateAge(dob);

      await runQuery(`
        INSERT INTO users (id, account_number, name, email, password_hash, dob, age, is_minor, kyc_status, mfa_enabled, mfa_secret)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'Tier 3 Private Wealth Verified', 1, 'ZENITHMFA789')
      `, [userId, accountNumber, 'Alex Rivers', 'genz.investor@zenithaura.com', passwordHash, dob, age]);

      await runQuery(`
        INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency)
        VALUES 
        ('acc_cash_01', ?, ?, 'Private HY-Cash Account', 245000.00, 'INR'),
        ('acc_wealth_02', ?, 'ZA-9910-4412', 'Private Wealth Vault', 1825000.00, 'INR'),
        ('acc_isp_03', ?, 'ZA-1102-7740', 'GenZ Savings Plan (ISP)', 348000.00, 'INR')
      `, [userId, accountNumber, userId, userId]);

      await runQuery(`
        INSERT INTO savings_plans (id, user_id, name, target_amount, current_amount, apy, category, auto_roundup, monthly_contribution, target_date)
        VALUES
        ('sp_01', ?, 'First Home Down-Payment', 500000.00, 224000.00, 6.75, 'Real Estate', 1, 10000.00, '2028-12-31'),
        ('sp_02', ?, 'Next-Gen Crypto & AI Stash', 150000.00, 89000.00, 7.50, 'Innovation', 1, 5000.00, '2027-06-30'),
        ('sp_03', ?, 'Emergency High-Yield Stash', 100000.00, 35000.00, 6.20, 'Security', 0, 3000.00, '2026-12-31')
      `, [userId, userId, userId]);

      await runQuery(`
        INSERT INTO portfolios (id, user_id, symbol, name, asset_type, quantity, avg_buy_price, current_price, category)
        VALUES
        ('pf_01', ?, 'NVDA', 'NVIDIA Corporation', 'Stock', 45, 9200.00, 11200.00, 'AI Tech'),
        ('pf_02', ?, 'AAPL', 'Apple Inc.', 'Stock', 80, 14500.00, 18700.00, 'Big Tech'),
        ('pf_03', ?, 'BTC', 'Bitcoin', 'Crypto', 0.25, 4000000.00, 5350000.00, 'Digital Asset'),
        ('pf_04', ?, 'ETH', 'Ethereum', 'Crypto', 2.50, 200000.00, 287500.00, 'Digital Asset'),
        ('pf_05', ?, 'VOO', 'Vanguard S&P 500 ETF', 'ETF', 20, 34000.00, 42700.00, 'Index Fund')
      `, [userId, userId, userId, userId, userId]);

      await runQuery(`
        INSERT INTO transactions (id, user_id, account_id, type, amount, description, category, step_up_mfa_verified)
        VALUES
        ('tx_01', ?, 'acc_cash_01', 'Deposit', 245000.00, 'Initial Private Banking Funding Deposit (INR)', 'Funding', 1),
        ('tx_02', ?, 'acc_isp_03', 'Roundup', 150.00, 'Smart Round-up from Swiggy & Uber Purchases', 'GenZ Savings', 0),
        ('tx_03', ?, 'acc_wealth_02', 'Trade', 112000.00, 'Bought 10 Shares of NVDA @ ₹11,200', 'Trading', 1),
        ('tx_04', ?, 'acc_cash_01', 'Transfer', 25000.00, 'UPI Peer-to-Peer Transfer to @sam_tech', 'Transfer', 1),
        ('tx_05', ?, 'acc_isp_03', 'Interest', 2480.00, 'Monthly 6.75% APY Yield Payout', 'Yield', 0)
      `, [userId, userId, userId, userId, userId]);
    }
  });
}

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery,
  initDB,
  calculateAge
};
