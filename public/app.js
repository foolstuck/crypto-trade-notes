const { createApp } = Vue;

// API URL configuration
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : window.location.origin;

createApp({
  data() {
    return {
      isAuthenticated: false,
      authView: 'login',
      currentUser: null,
      authError: '',
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: ''
      },
      showPasswordChange: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      passwordSuccess: '',
      trades: [],
      currentTrade: this.getEmptyTrade(),
      editingTrade: null,
      calendarDate: new Date(),
      selectedDate: null,
      theme: localStorage.getItem('theme') || 'dark',
      language: localStorage.getItem('language') || 'en',
      translations: {
        en: {
          appTitle: 'Crypto Trade Notes',
          appSubtitle: 'Track your cryptocurrency trades and learn from your decisions',
          login: 'Login',
          register: 'Register',
          username: 'Username',
          password: 'Password',
          email: 'Email',
          passwordMin: 'Minimum 6 characters',
          noAccount: "Don't have an account?",
          haveAccount: 'Already have an account?',
          createAccount: 'Create Account',
          welcome: 'Welcome',
          logout: 'Logout',
          changePassword: 'Change Password',
          currentPassword: 'Current Password',
          newPassword: 'New Password',
          confirmPassword: 'Confirm New Password',
          cancel: 'Cancel',
          addNewTrade: 'Add New Trade',
          editTrade: 'Edit Trade',
          dateTime: 'Date & Time',
          tradingPair: 'Trading Pair',
          tradeType: 'Trade Type',
          long: 'Long (Buy)',
          short: 'Short (Sell)',
          exchange: 'Exchange',
          entryPrice: 'Entry Price',
          exitPrice: 'Exit Price',
          amount: 'Amount',
          profitLoss: 'Profit/Loss ($)',
          tradeRationale: 'Trade Rationale',
          rationalePlaceholder: 'Why did you enter this trade? What was your analysis?',
          notesOutcome: 'Notes & Outcome',
          notesPlaceholder: 'What happened? What did you learn?',
          saveTrade: 'Save Trade',
          updateTrade: 'Update Trade',
          calendarView: 'Calendar View',
          tradeHistory: 'Trade History',
          showAll: 'Show All',
          noTrades: 'No trades recorded yet. Add your first trade above!',
          noTradesDay: 'No trades on this day.',
          tradesOn: 'Trades on',
          rationale: 'Rationale',
          notes: 'Notes',
          edit: 'Edit',
          delete: 'Delete',
          date: 'Date',
          entry: 'Entry',
          exit: 'Exit',
          open: 'Open',
          sun: 'Sun',
          mon: 'Mon',
          tue: 'Tue',
          wed: 'Wed',
          thu: 'Thu',
          fri: 'Fri',
          sat: 'Sat',
          january: 'January',
          february: 'February',
          march: 'March',
          april: 'April',
          may: 'May',
          june: 'June',
          july: 'July',
          august: 'August',
          september: 'September',
          october: 'October',
          november: 'November',
          december: 'December'
        },
        zh: {
          appTitle: '加密货币交易笔记',
          appSubtitle: '追踪您的加密货币交易并从决策中学习',
          login: '登录',
          register: '注册',
          username: '用户名',
          password: '密码',
          email: '邮箱',
          passwordMin: '最少6个字符',
          noAccount: '还没有账户？',
          haveAccount: '已有账户？',
          createAccount: '创建账户',
          welcome: '欢迎',
          logout: '登出',
          changePassword: '修改密码',
          currentPassword: '当前密码',
          newPassword: '新密码',
          confirmPassword: '确认新密码',
          cancel: '取消',
          addNewTrade: '添加新交易',
          editTrade: '编辑交易',
          dateTime: '日期时间',
          tradingPair: '交易对',
          tradeType: '交易类型',
          long: '做多（买入）',
          short: '做空（卖出）',
          exchange: '交易所',
          entryPrice: '入场价格',
          exitPrice: '出场价格',
          amount: '数量',
          profitLoss: '盈亏 ($)',
          tradeRationale: '交易理由',
          rationalePlaceholder: '为什么进入这笔交易？您的分析是什么？',
          notesOutcome: '笔记与结果',
          notesPlaceholder: '发生了什么？您学到了什么？',
          saveTrade: '保存交易',
          updateTrade: '更新交易',
          calendarView: '日历视图',
          tradeHistory: '交易历史',
          showAll: '显示全部',
          noTrades: '还没有交易记录。在上方添加您的第一笔交易！',
          noTradesDay: '这一天没有交易。',
          tradesOn: '交易于',
          rationale: '理由',
          notes: '笔记',
          edit: '编辑',
          delete: '删除',
          date: '日期',
          entry: '入场',
          exit: '出场',
          open: '开仓',
          sun: '日',
          mon: '一',
          tue: '二',
          wed: '三',
          thu: '四',
          fri: '五',
          sat: '六',
          january: '一月',
          february: '二月',
          march: '三月',
          april: '四月',
          may: '五月',
          june: '六月',
          july: '七月',
          august: '八月',
          september: '九月',
          october: '十月',
          november: '十一月',
          december: '十二月'
        }
      }
    };
  },
  computed: {
    t() {
      return this.translations[this.language];
    },
    sortedTrades() {
      return [...this.trades].sort((a, b) => {
        return new Date(b.datetime) - new Date(a.datetime);
      });
    },
    currentMonthYear() {
      const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june',
                         'july', 'august', 'september', 'october', 'november', 'december'];
      const monthName = this.t[monthKeys[this.calendarDate.getMonth()]];
      return `${monthName} ${this.calendarDate.getFullYear()}`;
    },
    calendarDays() {
      const year = this.calendarDate.getFullYear();
      const month = this.calendarDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const prevLastDay = new Date(year, month, 0);

      const firstDayWeek = firstDay.getDay();
      const lastDayNum = lastDay.getDate();
      const prevLastDayNum = prevLastDay.getDate();

      const days = [];

      // Previous month days
      for (let i = firstDayWeek - 1; i >= 0; i--) {
        const dayNum = prevLastDayNum - i;
        const date = new Date(year, month - 1, dayNum);
        days.push({
          dayNumber: dayNum,
          date: this.formatDateKey(date),
          otherMonth: true,
          tradeCount: this.getTradeCountForDate(date)
        });
      }

      // Current month days
      for (let i = 1; i <= lastDayNum; i++) {
        const date = new Date(year, month, i);
        days.push({
          dayNumber: i,
          date: this.formatDateKey(date),
          otherMonth: false,
          tradeCount: this.getTradeCountForDate(date)
        });
      }

      // Next month days
      const remainingDays = 42 - days.length; // 6 rows * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          dayNumber: i,
          date: this.formatDateKey(date),
          otherMonth: true,
          tradeCount: this.getTradeCountForDate(date)
        });
      }

      return days;
    },
    displayedTrades() {
      if (!this.selectedDate) {
        return this.sortedTrades;
      }

      return this.sortedTrades.filter(trade => {
        const tradeDate = new Date(trade.datetime);
        const tradeDateKey = this.formatDateKey(tradeDate);
        return tradeDateKey === this.selectedDate;
      });
    },
    selectedDateTitle() {
      if (!this.selectedDate) {
        return `${this.t.tradeHistory} (${this.trades.length})`;
      }

      const date = new Date(this.selectedDate);
      const count = this.displayedTrades.length;
      const locale = this.language === 'zh' ? 'zh-CN' : 'en-US';
      return `${this.t.tradesOn} ${date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })} (${count})`;
    }
  },
  methods: {
    async checkAuth() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          this.currentUser = await response.json();
          this.isAuthenticated = true;
          await this.loadTrades();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    },
    async login() {
      this.authError = '';
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(this.loginForm)
        });

        if (response.ok) {
          this.currentUser = await response.json();
          this.isAuthenticated = true;
          this.loginForm = { username: '', password: '' };
          await this.loadTrades();
        } else {
          const error = await response.json();
          this.authError = error.error || 'Login failed';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.authError = 'Failed to connect to server';
      }
    },
    async register() {
      this.authError = '';
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(this.registerForm)
        });

        if (response.ok) {
          this.currentUser = await response.json();
          this.isAuthenticated = true;
          this.registerForm = { username: '', email: '', password: '' };
          await this.loadTrades();
        } else {
          const error = await response.json();
          this.authError = error.error || 'Registration failed';
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.authError = 'Failed to connect to server';
      }
    },
    async logout() {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        this.isAuthenticated = false;
        this.currentUser = null;
        this.trades = [];
        this.authView = 'login';
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    showPasswordModal() {
      this.showPasswordChange = true;
      this.passwordError = '';
      this.passwordSuccess = '';
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },
    closePasswordModal() {
      this.showPasswordChange = false;
      this.passwordError = '';
      this.passwordSuccess = '';
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },
    async changePassword() {
      this.passwordError = '';
      this.passwordSuccess = '';

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'New passwords do not match';
        return;
      }

      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = 'Password must be at least 6 characters';
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword: this.passwordForm.currentPassword,
            newPassword: this.passwordForm.newPassword
          })
        });

        if (response.ok) {
          this.passwordSuccess = 'Password changed successfully!';
          setTimeout(() => {
            this.closePasswordModal();
          }, 2000);
        } else {
          const error = await response.json();
          this.passwordError = error.error || 'Failed to change password';
        }
      } catch (error) {
        console.error('Password change error:', error);
        this.passwordError = 'Failed to connect to server';
      }
    },
    getEmptyTrade() {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      return {
        datetime: localDateTime,
        pair: '',
        type: 'long',
        exchange: '',
        entryPrice: '0.00',
        exitPrice: '',
        amount: '',
        profitLoss: '',
        rationale: '',
        notes: ''
      };
    },
    async loadTrades() {
      try {
        const response = await fetch(`${API_URL}/api/trades`, {
          credentials: 'include'
        });
        if (response.ok) {
          this.trades = await response.json();
        } else if (response.status === 401) {
          this.isAuthenticated = false;
        }
      } catch (error) {
        console.error('Failed to load trades:', error);
      }
    },
    async saveTrade() {
      try {
        const tradeData = { ...this.currentTrade };

        if (this.editingTrade) {
          const response = await fetch(`${API_URL}/api/trades/${this.editingTrade.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(tradeData)
          });

          if (response.ok) {
            const updatedTrade = await response.json();
            const index = this.trades.findIndex(t => t.id === this.editingTrade.id);
            this.trades[index] = updatedTrade;
          } else if (response.status === 401) {
            this.isAuthenticated = false;
            return;
          }
        } else {
          const response = await fetch(`${API_URL}/api/trades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(tradeData)
          });

          if (response.ok) {
            const newTrade = await response.json();
            this.trades.push(newTrade);
          } else if (response.status === 401) {
            this.isAuthenticated = false;
            return;
          }
        }

        this.currentTrade = this.getEmptyTrade();
        this.editingTrade = null;
      } catch (error) {
        console.error('Failed to save trade:', error);
        alert('Failed to save trade. Please try again.');
      }
    },
    editTrade(trade) {
      this.editingTrade = trade;
      this.currentTrade = {
        datetime: trade.datetime,
        pair: trade.pair,
        type: trade.type,
        exchange: trade.exchange,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        amount: trade.amount,
        profitLoss: trade.profitLoss,
        rationale: trade.rationale,
        notes: trade.notes
      };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    cancelEdit() {
      this.editingTrade = null;
      this.currentTrade = this.getEmptyTrade();
    },
    async deleteTrade(id) {
      if (!confirm('Are you sure you want to delete this trade?')) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/trades/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok || response.status === 204) {
          this.trades = this.trades.filter(t => t.id !== id);
        } else if (response.status === 401) {
          this.isAuthenticated = false;
        }
      } catch (error) {
        console.error('Failed to delete trade:', error);
        alert('Failed to delete trade. Please try again.');
      }
    },
    formatDate(datetime) {
      return new Date(datetime).toLocaleString();
    },
    formatDateKey(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    getTradeCountForDate(date) {
      const dateKey = this.formatDateKey(date);
      return this.trades.filter(trade => {
        const tradeDate = new Date(trade.datetime);
        const tradeDateKey = this.formatDateKey(tradeDate);
        return tradeDateKey === dateKey;
      }).length;
    },
    previousMonth() {
      this.calendarDate = new Date(
        this.calendarDate.getFullYear(),
        this.calendarDate.getMonth() - 1,
        1
      );
    },
    nextMonth() {
      this.calendarDate = new Date(
        this.calendarDate.getFullYear(),
        this.calendarDate.getMonth() + 1,
        1
      );
    },
    selectDay(day) {
      if (day.otherMonth) {
        return;
      }
      this.selectedDate = day.date;

      // Scroll to trades section
      setTimeout(() => {
        const tradesSection = document.querySelector('.trades-section');
        if (tradesSection) {
          tradesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
    isSelectedDay(date) {
      return this.selectedDate === date;
    },
    clearDateFilter() {
      this.selectedDate = null;
    },
    formatProfit(profit) {
      if (!profit) return '$0.00';
      const num = parseFloat(profit);
      return (num >= 0 ? '+' : '') + '$' + num.toFixed(2);
    },
    profitClass(profit) {
      if (!profit) return '';
      return parseFloat(profit) >= 0 ? 'profit-positive' : 'profit-negative';
    },
    tradeClass(trade) {
      if (!trade.exitPrice) return 'trade-open';
      if (!trade.profitLoss) return '';
      return parseFloat(trade.profitLoss) >= 0 ? 'trade-win' : 'trade-loss';
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', this.theme);
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    toggleLanguage() {
      this.language = this.language === 'en' ? 'zh' : 'en';
      localStorage.setItem('language', this.language);
    }
  },
  mounted() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.checkAuth();
  }
}).mount('#app');
