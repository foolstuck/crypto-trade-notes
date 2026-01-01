# Crypto Trade Notes

A web application for tracking and journaling cryptocurrency trades.

## Features

- User authentication (register and login)
- Secure password hashing with bcrypt
- Session-based authentication
- User-specific trade data
- Log cryptocurrency trades with detailed information
- Track entry/exit prices, profit/loss
- Record trade rationale and notes
- View trade history sorted by date
- Edit and delete trades
- Responsive design for desktop and mobile

## Installation

1. Install dependencies:
```bash
cd crypto-trade-notes
npm install
```

## Running the Application

1. Start the server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Registration and Login
1. When you first visit the application, you'll see a login screen
2. Click "Register" to create a new account
3. Enter a username, email, and password (minimum 6 characters)
4. After registration, you'll be automatically logged in

### Adding a Trade
1. Fill in the trade details form at the top of the page
2. Enter the trading pair (e.g., BTC/USDT)
3. Select trade type (Long/Short)
4. Add entry price, exit price (optional), and amount
5. Record your trade rationale and notes
6. Click "Save Trade"

### Managing Trades
- View all your trades in the history section
- Edit a trade by clicking the "Edit" button
- Delete a trade by clicking the "Delete" button
- Trades are color-coded: green for wins, red for losses, orange for open trades
- Each user can only see and manage their own trades

### Logging Out
- Click the "Logout" button in the header to end your session

## Data Storage

- User data is stored in `server/users.json` file with bcrypt-hashed passwords
- Trade data is stored in `server/trades.json` file
- All data persists between server restarts
- Each user's trades are isolated and private

## Security

- Passwords are hashed using bcrypt before storage
- Session-based authentication with HTTP-only cookies
- User data is isolated per account
- Sessions expire after 7 days of inactivity

## Tech Stack

- **Frontend**: Vue.js 3 (CDN)
- **Backend**: Node.js + Express
- **Authentication**: bcrypt + express-session
- **Storage**: JSON file-based database
