const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { initDB, getQuery, allQuery, runQuery, calculateAge } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'zenith_aura_private_key_2026';

app.use(cors());
app.use(express.json());

// Initialize Database
initDB().catch(err => console.error('[DB Error]', err));

// Temporary in-memory MFA OTP store
const mfaOtpStore = new Map();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// ==========================================
// 1. AUTHENTICATION, ONBOARDING & PRE-LOGIN MFA
// ==========================================

app.post('/api/auth/request-login-otp', async (req, res) => {
  try {
    const { accountNumberOrEmail, password } = req.body;
    if (!accountNumberOrEmail || !password) {
      return res.status(400).json({ error: 'Account Number (or Email) and Password are required' });
    }

    const term = accountNumberOrEmail.trim();
    const user = await getQuery(
      'SELECT * FROM users WHERE account_number = ? OR email = ?',
      [term, term]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid account credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid account credentials' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    mfaOtpStore.set(user.id, { code: otpCode, expiresAt });

    res.json({
      message: '2FA Passcode generated successfully',
      accountNumber: user.account_number,
      otpCode,
      instructions: 'Enter this 6-digit passcode to complete pre-login authentication.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { accountNumberOrEmail, password, otpCode } = req.body;
    if (!accountNumberOrEmail || !password) {
      return res.status(400).json({ error: 'Account Number (or Email) and Password are required' });
    }

    const term = accountNumberOrEmail.trim();
    const user = await getQuery(
      'SELECT * FROM users WHERE account_number = ? OR email = ?',
      [term, term]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid account credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid account credentials' });
    }

    if (!otpCode) {
      return res.status(422).json({
        error: 'MFA_REQUIRED',
        message: 'Pre-login Multi-Factor Authentication required. Request a 2FA OTP code first.'
      });
    }

    const storedMfa = mfaOtpStore.get(user.id);
    if (!storedMfa || Date.now() > storedMfa.expiresAt || storedMfa.code !== otpCode.trim()) {
      return res.status(400).json({ error: 'Invalid or expired 2FA OTP passcode. Click "Get 2FA OTP Code" again.' });
    }

    mfaOtpStore.delete(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, accountNumber: user.account_number, age: user.age, is_minor: user.is_minor },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        accountNumber: user.account_number,
        name: user.name,
        email: user.email,
        dob: user.dob,
        age: user.age,
        isMinor: Boolean(user.is_minor),
        kycStatus: user.kyc_status,
        mfaEnabled: Boolean(user.mfa_enabled)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, dob, initialDeposit, fundingSource } = req.body;
    if (!name || !email || !password || !dob) {
      return res.status(400).json({ error: 'Name, email, password, and date of birth (DOB) are required' });
    }

    const age = calculateAge(dob);
    const isMinor = age < 18 ? 1 : 0;
    const kycStatus = isMinor ? 'Minor Restricted Guarded' : 'Tier 3 Private Wealth Verified';
    
    const existing = await getQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userId = 'usr_' + uuidv4().substring(0, 8);
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(1000 + Math.random() * 9000);
    const accountNumber = `ZA-${randPart1}-${randPart2}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const fundAmount = parseFloat(initialDeposit || 100000.00); // Default ₹1,00,000

    await runQuery(`
      INSERT INTO users (id, account_number, name, email, password_hash, dob, age, is_minor, kyc_status, mfa_enabled, mfa_secret)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'ZENITHMFA999')
    `, [userId, accountNumber, name, email, passwordHash, dob, age, isMinor, kycStatus]);

    const mainAccId = 'acc_' + uuidv4().substring(0, 8);
    await runQuery(`
      INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency)
      VALUES (?, ?, ?, 'Private HY-Cash Account', ?, 'INR')
    `, [mainAccId, userId, accountNumber, fundAmount]);

    const ispVaultId = 'sp_' + uuidv4().substring(0, 8);
    const ispVaultAmount = Math.round(fundAmount * 0.20 * 100) / 100;
    await runQuery(`
      INSERT INTO savings_plans (id, user_id, name, target_amount, current_amount, apy, category)
      VALUES (?, ?, 'GenZ Starter Wealth Vault', ?, ?, 6.75, 'Goal Stash')
    `, [ispVaultId, userId, fundAmount * 2, ispVaultAmount]);

    // Fixed SQL parameter alignment
    await runQuery(`
      INSERT INTO transactions (id, user_id, account_id, type, amount, description, category, step_up_mfa_verified)
      VALUES (?, ?, ?, 'Deposit', ?, ?, 'Funding Deposit', ?)
    `, [
      'tx_' + uuidv4().substring(0, 8), 
      userId, 
      mainAccId, 
      fundAmount, 
      `Initial Onboarding Transfer via ${fundingSource || 'HDFC Private Banking / UPI'}`,
      1
    ]);

    await runQuery(`
      INSERT INTO portfolios (id, user_id, symbol, name, asset_type, quantity, avg_buy_price, current_price, category)
      VALUES (?, ?, 'NVDA', 'NVIDIA Corporation', 'Stock', 10, 9200.00, 11200.00, 'AI Tech')
    `, ['pf_' + uuidv4().substring(0, 8), userId]);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    mfaOtpStore.set(userId, { code: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });

    const token = jwt.sign(
      { id: userId, email, accountNumber, age, is_minor: isMinor },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account registered and funded in INR successfully!',
      token,
      accountNumber,
      initialDeposit: fundAmount,
      otpCode,
      user: {
        id: userId,
        accountNumber,
        name,
        email,
        dob,
        age,
        isMinor: Boolean(isMinor),
        kycStatus,
        mfaEnabled: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery('SELECT id, account_number, name, email, dob, age, is_minor, kyc_status, mfa_enabled FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      ...user,
      accountNumber: user.account_number,
      isMinor: Boolean(user.is_minor),
      mfaEnabled: Boolean(user.mfa_enabled),
      complianceNotes: user.is_minor 
        ? 'Under 18 Account: High-risk crypto disabled. Parental co-sign required for transfers > ₹50,000.'
        : 'Full Private Banking Clearance (Tier 3 Verified).'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. MULTI-FACTOR AUTHENTICATION (MFA) APIs
// ==========================================

app.post('/api/auth/mfa/generate', authenticateToken, async (req, res) => {
  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    mfaOtpStore.set(req.user.id, { code: otpCode, expiresAt });

    res.json({
      message: 'Step-Up MFA code generated successfully',
      otpCode,
      expiresInSeconds: 300,
      instructions: 'Enter this 6-digit passcode to authorize operation.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/mfa/verify', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const stored = mfaOtpStore.get(req.user.id);

    if (!stored || Date.now() > stored.expiresAt) {
      return res.status(400).json({ valid: false, error: 'MFA code expired or invalid. Please request a new code.' });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({ valid: false, error: 'Invalid MFA passcode. Please try again.' });
    }

    mfaOtpStore.delete(req.user.id);
    res.json({ valid: true, message: 'Multi-Factor Authentication verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PRIVATE BANKING & BALANCE HUB APIs (INR)
// ==========================================

app.get('/api/banking/accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await allQuery('SELECT * FROM accounts WHERE user_id = ?', [req.user.id]);
    const portfolio = await allQuery('SELECT * FROM portfolios WHERE user_id = ?', [req.user.id]);
    const savingsPlans = await allQuery('SELECT * FROM savings_plans WHERE user_id = ?', [req.user.id]);

    const cashTotal = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const portfolioTotal = portfolio.reduce((sum, item) => sum + (item.quantity * item.current_price), 0);
    const savingsTotal = savingsPlans.reduce((sum, item) => sum + item.current_amount, 0);
    
    const netWorth = cashTotal + portfolioTotal;

    res.json({
      accounts,
      summary: {
        netWorth,
        cashTotal,
        portfolioTotal,
        savingsTotal,
        currency: 'INR'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/banking/transfer', authenticateToken, async (req, res) => {
  try {
    const { fromAccountId, toRecipient, amount, description, mfaCode } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Transfer amount must be greater than ₹0' });
    }

    // Step-Up MFA for Transfers >= ₹50,000
    if (amount >= 50000) {
      if (!mfaCode) {
        return res.status(422).json({ 
          error: 'MFA_REQUIRED', 
          message: 'Transfers of ₹50,000 or more require Multi-Factor Authentication verification.' 
        });
      }
      const stored = mfaOtpStore.get(req.user.id);
      if (!stored || stored.code !== mfaCode.trim()) {
        return res.status(400).json({ error: 'Invalid or expired MFA code for high-value transfer' });
      }
      mfaOtpStore.delete(req.user.id);
    }

    const account = await getQuery('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [fromAccountId, req.user.id]);
    if (!account) {
      return res.status(404).json({ error: 'Source account not found' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient account balance for transfer' });
    }

    const newBalance = account.balance - amount;
    await runQuery('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, fromAccountId]);

    const txId = 'tx_' + uuidv4().substring(0, 8);
    await runQuery(`
      INSERT INTO transactions (id, user_id, account_id, type, amount, description, category, step_up_mfa_verified)
      VALUES (?, ?, ?, 'Transfer', ?, ?, 'Transfer', ?)
    `, [txId, req.user.id, fromAccountId, amount, description || `Transfer to ${toRecipient}`, amount >= 50000 ? 1 : 0]);

    res.json({
      message: 'Transfer executed successfully!',
      transactionId: txId,
      newBalance,
      amountTransferred: amount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/banking/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await allQuery(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 50',
      [req.user.id]
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. GEN-Z SAVINGS & TRADING APIs (INR)
// ==========================================

app.get('/api/savings/plans', authenticateToken, async (req, res) => {
  try {
    const plans = await allQuery('SELECT * FROM savings_plans WHERE user_id = ?', [req.user.id]);
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/savings/create', authenticateToken, async (req, res) => {
  try {
    const { name, targetAmount, category, monthlyContribution, targetDate } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Vault name and target amount are required' });
    }

    const planId = 'sp_' + uuidv4().substring(0, 8);
    const apy = 6.75;

    await runQuery(`
      INSERT INTO savings_plans (id, user_id, name, target_amount, current_amount, apy, category, monthly_contribution, target_date)
      VALUES (?, ?, ?, ?, 0.0, ?, ?, ?, ?)
    `, [planId, req.user.id, name, parseFloat(targetAmount), apy, category || 'GenZ Goal', parseFloat(monthlyContribution || 2500), targetDate || '2028-01-01']);

    res.status(201).json({
      message: 'GenZ Individual Savings Plan created successfully!',
      plan: { id: planId, name, targetAmount, currentAmount: 0.0, apy }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/savings/deposit', authenticateToken, async (req, res) => {
  try {
    const { planId, amount, fromAccountId } = req.body;
    const plan = await getQuery('SELECT * FROM savings_plans WHERE id = ? AND user_id = ?', [planId, req.user.id]);
    if (!plan) return res.status(404).json({ error: 'Savings Plan not found' });

    const account = await getQuery('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [fromAccountId, req.user.id]);
    if (!account || account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds in selected account' });
    }

    await runQuery('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromAccountId]);
    await runQuery('UPDATE savings_plans SET current_amount = current_amount + ? WHERE id = ?', [amount, planId]);

    await runQuery(`
      INSERT INTO transactions (id, user_id, account_id, type, amount, description, category)
      VALUES (?, ?, ?, 'Savings Deposit', ?, ?, 'GenZ ISP')
    `, ['tx_' + uuidv4().substring(0, 8), req.user.id, fromAccountId, amount, `Deposit into ${plan.name} Vault`]);

    res.json({ message: 'Funds stashed into Savings Vault successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/savings/toggle-roundup', authenticateToken, async (req, res) => {
  try {
    const { planId, enabled } = req.body;
    await runQuery('UPDATE savings_plans SET auto_roundup = ? WHERE id = ? AND user_id = ?', [enabled ? 1 : 0, planId, req.user.id]);
    res.json({ message: `Smart Round-Up ${enabled ? 'Enabled' : 'Disabled'} for this Savings Plan.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trading/assets', async (req, res) => {
  const assets = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'Stock', price: 11200.00, changePct: +3.45, category: 'AI & Semiconductors' },
    { symbol: 'AAPL', name: 'Apple Inc', type: 'Stock', price: 18700.00, changePct: +1.12, category: 'Consumer Tech' },
    { symbol: 'TSLA', name: 'Tesla Motors', type: 'Stock', price: 18200.00, changePct: -0.85, category: 'Clean Tech' },
    { symbol: 'BTC', name: 'Bitcoin', type: 'Crypto', price: 5350000.00, changePct: +4.80, category: 'Digital Gold (Crypto)', riskLevel: 'High' },
    { symbol: 'ETH', name: 'Ethereum', type: 'Crypto', price: 287500.00, changePct: +2.15, category: 'DeFi (Crypto)', riskLevel: 'High' },
    { symbol: 'SOL', name: 'Solana', type: 'Crypto', price: 12850.00, changePct: +6.70, category: 'Layer 1 (Crypto)', riskLevel: 'High' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', price: 42700.00, changePct: +0.65, category: 'Broad Market Index' }
  ];
  res.json(assets);
});

app.get('/api/trading/portfolio', authenticateToken, async (req, res) => {
  try {
    const portfolio = await allQuery('SELECT * FROM portfolios WHERE user_id = ?', [req.user.id]);
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trading/execute', authenticateToken, async (req, res) => {
  try {
    const { symbol, name, assetType, orderType, shares, price, accountId, mfaCode } = req.body;
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (user.is_minor && assetType === 'Crypto') {
      return res.status(403).json({
        error: 'AGE_RESTRICTION',
        message: 'Under 18 Regulatory Protection: High-risk unbacked crypto assets are disabled for minor wealth accounts.'
      });
    }

    const totalAmount = parseFloat(shares) * parseFloat(price);

    // Step-Up MFA for Trades >= ₹1,00,000
    if (totalAmount >= 100000) {
      if (!mfaCode) {
        return res.status(422).json({
          error: 'MFA_REQUIRED',
          message: `Trades over ₹1,00,000 require Multi-Factor Authentication for execution.`
        });
      }
      const stored = mfaOtpStore.get(req.user.id);
      if (!stored || stored.code !== mfaCode.trim()) {
        return res.status(400).json({ error: 'Invalid or expired MFA code for trade execution' });
      }
      mfaOtpStore.delete(req.user.id);
    }

    const account = await getQuery('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.id]);
    if (!account) return res.status(404).json({ error: 'Selected funding account not found' });

    if (orderType === 'BUY') {
      if (account.balance < totalAmount) {
        return res.status(400).json({ error: 'Insufficient funds in cash account' });
      }
      await runQuery('UPDATE accounts SET balance = balance - ? WHERE id = ?', [totalAmount, accountId]);

      const existingHolding = await getQuery('SELECT * FROM portfolios WHERE user_id = ? AND symbol = ?', [req.user.id, symbol]);
      if (existingHolding) {
        const newQty = existingHolding.quantity + parseFloat(shares);
        const newAvgPrice = ((existingHolding.quantity * existingHolding.avg_buy_price) + totalAmount) / newQty;
        await runQuery('UPDATE portfolios SET quantity = ?, avg_buy_price = ?, current_price = ? WHERE id = ?', [newQty, newAvgPrice, price, existingHolding.id]);
      } else {
        await runQuery(`
          INSERT INTO portfolios (id, user_id, symbol, name, asset_type, quantity, avg_buy_price, current_price, category)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, ['pf_' + uuidv4().substring(0, 8), req.user.id, symbol, name, assetType, parseFloat(shares), parseFloat(price), parseFloat(price), assetType]);
      }
    } else if (orderType === 'SELL') {
      const existingHolding = await getQuery('SELECT * FROM portfolios WHERE user_id = ? AND symbol = ?', [req.user.id, symbol]);
      if (!existingHolding || existingHolding.quantity < parseFloat(shares)) {
        return res.status(400).json({ error: 'Insufficient asset shares available to sell' });
      }

      await runQuery('UPDATE accounts SET balance = balance + ? WHERE id = ?', [totalAmount, accountId]);

      const remainingQty = existingHolding.quantity - parseFloat(shares);
      if (remainingQty <= 0) {
        await runQuery('DELETE FROM portfolios WHERE id = ?', [existingHolding.id]);
      } else {
        await runQuery('UPDATE portfolios SET quantity = ? WHERE id = ?', [remainingQty, existingHolding.id]);
      }
    }

    await runQuery(`
      INSERT INTO trades (id, user_id, symbol, type, shares, price, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['trd_' + uuidv4().substring(0, 8), req.user.id, symbol, orderType, parseFloat(shares), parseFloat(price), totalAmount]);

    await runQuery(`
      INSERT INTO transactions (id, user_id, account_id, type, amount, description, category, step_up_mfa_verified)
      VALUES (?, ?, ?, 'Trade', ?, ?, 'Trading', ?)
    `, ['tx_' + uuidv4().substring(0, 8), req.user.id, accountId, totalAmount, `${orderType} ${shares} shares of ${symbol}`, totalAmount >= 100000 ? 1 : 0]);

    res.json({
      message: `Successfully executed ${orderType} order for ${shares} ${symbol}!`,
      totalAmount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Zenith Aura Private Banking & Wealth API Server (INR)`);
  console.log(` Running at http://localhost:${PORT}`);
  console.log(`==================================================`);
});
