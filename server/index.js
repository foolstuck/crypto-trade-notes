const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcrypt');
const path = require('path');
const pool = require('./db/config');
const initDatabase = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for production
const corsOptions = {
  origin: true,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'crypto-trade-notes-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  }
}));
app.use(express.static(path.join(__dirname, '../public')));

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if username exists
    const usernameCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email exists
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];
    req.session.userId = newUser.id;
    req.session.username = newUser.username;

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// User Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Check Authentication Status
app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    id: req.session.userId,
    username: req.session.username
  });
});

// Change Password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const result = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.session.userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user's trades
app.get('/api/trades', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY datetime DESC',
      [req.session.userId]
    );

    // Convert database format to frontend format
    const trades = result.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id,
      datetime: row.datetime,
      pair: row.pair,
      type: row.type,
      exchange: row.exchange,
      entryPrice: row.entry_price,
      exitPrice: row.exit_price,
      amount: row.amount,
      profitLoss: row.profit_loss,
      rationale: row.rationale,
      notes: row.notes,
      createdAt: row.created_at
    }));

    res.json(trades);
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to read trades' });
  }
});

// Create a new trade
app.post('/api/trades', requireAuth, async (req, res) => {
  try {
    const { datetime, pair, type, exchange, entryPrice, exitPrice, amount, profitLoss, rationale, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO trades
       (user_id, datetime, pair, type, exchange, entry_price, exit_price, amount, profit_loss, rationale, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.session.userId, datetime, pair, type, exchange, entryPrice, exitPrice, amount, profitLoss, rationale, notes]
    );

    const trade = result.rows[0];
    res.status(201).json({
      id: trade.id.toString(),
      userId: trade.user_id,
      datetime: trade.datetime,
      pair: trade.pair,
      type: trade.type,
      exchange: trade.exchange,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      amount: trade.amount,
      profitLoss: trade.profit_loss,
      rationale: trade.rationale,
      notes: trade.notes,
      createdAt: trade.created_at
    });
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

// Update a trade
app.put('/api/trades/:id', requireAuth, async (req, res) => {
  try {
    const tradeId = req.params.id;
    const { datetime, pair, type, exchange, entryPrice, exitPrice, amount, profitLoss, rationale, notes } = req.body;

    // Check if trade belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM trades WHERE id = $1 AND user_id = $2',
      [tradeId, req.session.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const result = await pool.query(
      `UPDATE trades
       SET datetime = $1, pair = $2, type = $3, exchange = $4,
           entry_price = $5, exit_price = $6, amount = $7, profit_loss = $8,
           rationale = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [datetime, pair, type, exchange, entryPrice, exitPrice, amount, profitLoss, rationale, notes, tradeId, req.session.userId]
    );

    const trade = result.rows[0];
    res.json({
      id: trade.id.toString(),
      userId: trade.user_id,
      datetime: trade.datetime,
      pair: trade.pair,
      type: trade.type,
      exchange: trade.exchange,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      amount: trade.amount,
      profitLoss: trade.profit_loss,
      rationale: trade.rationale,
      notes: trade.notes,
      createdAt: trade.created_at,
      updatedAt: trade.updated_at
    });
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({ error: 'Failed to update trade' });
  }
});

// Delete a trade
app.delete('/api/trades/:id', requireAuth, async (req, res) => {
  try {
    const tradeId = req.params.id;

    const result = await pool.query(
      'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING id',
      [tradeId, req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
