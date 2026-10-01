import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  DollarSign, 
  Settings, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  LogOut, 
  Shield, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  AlertCircle,
  Zap,
  Award,
  ChevronRight,
  CheckSquare,
  Square,
  Mail,
  Lock,
  User,
  Phone
} from 'lucide-react';

export default function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null); // { email, role: 'admin' | 'customer', firstName, lastName }
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'verify'
  
  // Login Inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Register Inputs
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Verification State
  const [pendingUser, setPendingUser] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'bookings', 'pricing', 'expenses', 'reports'

  // --- COURTS CONFIGURATION ---
  const courts = [
    { id: 'B1', name: 'Badminton Court 1', type: 'badminton' },
    { id: 'B2', name: 'Badminton Court 2', type: 'badminton' },
    { id: 'P1', name: 'Pickleball Court 1', type: 'pickleball' },
    { id: 'P2', name: 'Pickleball Court 2', type: 'pickleball' },
  ];

  // --- TIME SLOTS ---
  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  // --- PRICING CONFIGURATION ---
  const [prices, setPrices] = useState({
    badminton: 25,
    pickleball: 20
  });

  // --- BOOKINGS STATE ---
  const [bookings, setBookings] = useState([
    { id: 'B-101', courtId: 'B1', date: '2026-10-01', time: '09:00 AM', customer: 'John Doe', status: 'Confirmed', payment: 'Paid', amount: 25 },
    { id: 'B-102', courtId: 'P1', date: '2026-10-01', time: '10:00 AM', customer: 'Sarah Smith', status: 'Confirmed', payment: 'Paid', amount: 20 },
    { id: 'B-103', courtId: 'B2', date: '2026-10-01', time: '05:00 PM', customer: 'Alex Johnson', status: 'Confirmed', payment: 'Pending', amount: 25 },
  ]);

  // --- EXPENDITURES STATE ---
  const [expenses, setExpenses] = useState([
    { id: 'E-1', date: '2026-10-01', description: 'Monthly LED Court Lighting Bill', amount: 150 },
    { id: 'E-2', date: '2026-09-28', description: 'Pickleball Net Replacement', amount: 85 },
    { id: 'E-3', date: '2026-09-25', description: 'Floor Deep Cleaning & Polishing', amount: 300 }
  ]);

  // --- NEW EXPENDITURE FORM STATE ---
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpDate, setNewExpDate] = useState(new Date().toISOString().split('T')[0]);

  // --- MULTI-SLOT CART STATE ---
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlotsCart, setSelectedSlotsCart] = useState([]); 
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // --- ADMIN MANUAL MULTI-BOOKING MODAL STATE ---
  const [showAdminAddModal, setShowAdminAddModal] = useState(false);
  const [adminCustomer, setAdminCustomer] = useState('');
  const [adminCart, setAdminCart] = useState([]); 

  // --- REPORT PERIOD FILTER ---
  const [reportPeriod, setReportPeriod] = useState('all');

  // --- AUTH HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;

    if (emailInput === 'admin@sports.com') {
      setUser({ email: emailInput, role: 'admin', firstName: 'System', lastName: 'Admin' });
    } else {
      setUser({ email: emailInput, role: 'customer', firstName: 'Valued', lastName: 'Customer' });
    }
    setActiveTab('calendar');
  };

  const handleStartRegistration = async (e) => {
  e.preventDefault();
  if (!regFirstName || !regLastName || !regPhone || !regDob || !regEmail || !regPassword) return;

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const response = await fetch('/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regEmail, code, firstName: regFirstName }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send email');

    setPendingUser({
      firstName: regFirstName, lastName: regLastName, phone: regPhone, 
      dob: regDob, email: regEmail, password: regPassword, role: 'customer'
    });
    setAuthMode('verify');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    if (enteredCode.trim() === simulatedCode) {
      setUser(pendingUser);
      setAuthMode('login');
      setActiveTab('calendar');
      alert('Email verified successfully! Welcome to AceCourt Arena.');
    } else {
      alert('Invalid verification code. Please check the simulated notice box.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEmailInput('');
    setPasswordInput('');
    setSelectedSlotsCart([]);
    setAuthMode('login');
  };

  // --- BOOKING LOGIC ---
  const isSlotBooked = (courtId, date, time) => {
    return bookings.find(b => b.courtId === courtId && b.date === date && b.time === time && b.status !== 'Cancelled');
  };

  const toggleSlotSelection = (courtId, time) => {
    const court = courts.find(c => c.id === courtId);
    const amount = prices[court.type];

    const existingIndex = selectedSlotsCart.findIndex(s => s.courtId === courtId && s.time === time);
    if (existingIndex > -1) {
      setSelectedSlotsCart(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      setSelectedSlotsCart(prev => [...prev, { courtId, time, courtType: court.type, amount, courtName: court.name }]);
    }
  };

  const handleCustomerMultiBook = () => {
    if (selectedSlotsCart.length === 0) return;

    const newBookings = selectedSlotsCart.map(slot => ({
      id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      courtId: slot.courtId,
      date: selectedDate,
      time: slot.time,
      customer: `${user.firstName} ${user.lastName} (${user.email})`,
      status: 'Confirmed',
      payment: 'Paid',
      amount: slot.amount
    }));

    setBookings(prev => [...prev, ...newBookings]);
    setSelectedSlotsCart([]);
    setShowCheckoutModal(false);
    alert(`Successfully booked ${newBookings.length} court slot(s) in a single transaction!`);
  };

  const handleAdminToggleCart = (courtId, time) => {
    const court = courts.find(c => c.id === courtId);
    const amount = prices[court.type];

    const existingIndex = adminCart.findIndex(s => s.courtId === courtId && s.time === time);
    if (existingIndex > -1) {
      setAdminCart(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      setAdminCart(prev => [...prev, { courtId, time, courtType: court.type, amount, courtName: court.name }]);
    }
  };

  const handleAdminMultiBook = (e) => {
    e.preventDefault();
    if (!adminCustomer || adminCart.length === 0) return;

    const newBookings = adminCart.map(slot => ({
      id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      courtId: slot.courtId,
      date: selectedDate,
      time: slot.time,
      customer: adminCustomer,
      status: 'Confirmed',
      payment: 'Paid',
      amount: slot.amount
    }));

    setBookings(prev => [...prev, ...newBookings]);
    setAdminCart([]);
    setShowAdminAddModal(false);
    setAdminCustomer('');
    alert(`Successfully processed admin multi-slot booking for ${adminCustomer}!`);
  };

  const cancelBooking = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
  };

  // --- EXPENDITURE LOGIC ---
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpDesc || !newExpAmount) return;

    const newExpense = {
      id: `E-${Date.now()}`,
      date: newExpDate,
      description: newExpDesc,
      amount: parseFloat(newExpAmount)
    };

    setExpenses([newExpense, ...expenses]);
    setNewExpDesc('');
    setNewExpAmount('');
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- FINANCIAL REPORT CALCULATIONS ---
  const getFilteredData = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    const filteredBookings = bookings.filter(b => {
      if (b.status === 'Cancelled') return false;
      if (reportPeriod === 'today') return b.date === todayStr;
      if (reportPeriod === 'month') return b.date.startsWith(currentMonthStr);
      return true;
    });

    const filteredExpenses = expenses.filter(e => {
      if (reportPeriod === 'today') return e.date === todayStr;
      if (reportPeriod === 'month') return e.date.startsWith(currentMonthStr);
      return true;
    });

    const totalIncome = filteredBookings.reduce((sum, b) => sum + b.amount, 0);
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    return { filteredBookings, filteredExpenses, totalIncome, totalExpense, netProfit };
  };

  const { filteredBookings, filteredExpenses, totalIncome, totalExpense, netProfit } = getFilteredData();


  // ================= RENDER AUTHENTICATION & REGISTRATION PAGE =================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 lg:p-8 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          <div className="lg:col-span-6 relative bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 p-8 lg:p-10 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-emerald-500 to-blue-600 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-wider text-white uppercase">AceCourt Arena</span>
            </div>

            <div className="relative z-10 my-8 space-y-5">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Premier Indoor Sports Facility</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Smash. Rally. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Dominate the Court.</span>
              </h1>

              <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                Experience high-performance indoor action. Register now with secure email verification to book professional surfaces instantly.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl backdrop-blur">
                  <span className="text-emerald-400 font-bold block text-base">2 Courts</span>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Pro Badminton</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl backdrop-blur">
                  <span className="text-cyan-400 font-bold block text-base">2 Courts</span>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Pro Pickleball</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
              <span>Open Daily: 8:00 AM – 10:00 PM</span>
              <span className="text-emerald-400 font-medium">Verified Portal</span>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 lg:p-10 flex flex-col justify-center bg-slate-900">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {authMode === 'verify' ? 'Verify Your Email' : authMode === 'register' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {authMode === 'verify' 
                  ? 'We have sent a verification code to your email address.' 
                  : authMode === 'register' 
                  ? 'Enter your personal details to set up your profile.' 
                  : 'Sign in to manage bookings or reserve courts.'}
              </p>
            </div>

            {authMode !== 'verify' && (
              <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800">
                <button 
                  onClick={() => setAuthMode('login')} 
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${authMode === 'login' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthMode('register')} 
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${authMode === 'register' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Register
                </button>
              </div>
            )}

            {/* --- VIEW 1: SIGN IN FORM --- */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. admin@sports.com" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">Hint: Use <code className="text-blue-400">admin@sports.com</code> for admin access.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 mt-2"
                >
                  <span>Access Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* --- VIEW 2: DETAILED REGISTRATION FORM --- */}
            {authMode === 'register' && (
              <form onSubmit={handleStartRegistration} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">First Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John" 
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Last Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Doe" 
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="(555) 000-0000" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email ID</label>
                  <input 
                    type="email" 
                    required
                    placeholder="john.doe@example.com" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 mt-1"
                >
                  <span>Continue & Verify Email</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* --- VIEW 3: EMAIL VERIFICATION STEP --- */}
            {authMode === 'verify' && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-xs text-blue-300 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-blue-400">
                    <Mail className="w-4 h-4" />
                    <span>Verification Email Dispatched</span>
                  </div>
                  <p>We sent a 6-digit verification code to <span className="text-white font-semibold">{pendingUser?.email}</span>.</p>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-blue-500/20 text-slate-300 text-[11px]">
                    <span className="text-amber-400 font-bold block mb-0.5">Simulation Notice:</span>
                    Your verification code is: <strong className="text-emerald-400 tracking-widest text-sm">{simulatedCode}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Enter 6-Digit Code</label>
                  <input 
                    type="text" 
                    maxLength="6"
                    required
                    placeholder="123456" 
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center tracking-widest text-lg font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl text-xs transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30"
                  >
                    Verify & Complete
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      </div>
    );
  }

  // ================= RENDER MAIN APP =================
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">AceCourt Hub</h1>
              <p className="text-xs text-slate-400">Badminton & Pickleball Facility</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
              <span className="text-slate-300">{user.firstName ? `${user.firstName} ${user.lastName}` : user.email}</span>
              <span className="bg-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-200">
                {user.role}
              </span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 flex space-x-2 overflow-x-auto py-2">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Court Availability & Booking</span>
          </button>

          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Users className="w-4 h-4" />
            <span>{isAdmin ? 'All Bookings Ledger' : 'My Bookings'}</span>
          </button>

          {isAdmin && (
            <>
              <button 
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Pricing Settings</span>
              </button>

              <button 
                onClick={() => setActiveTab('expenses')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Expenditure Tracker</span>
              </button>

              <button 
                onClick={() => setActiveTab('reports')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Financial Reports & P&L</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: CALENDAR & AVAILABILITY */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold">Court Availability & Cart</h2>
                <p className="text-xs text-slate-400">Select multiple available slots to add them to your cart, then check out in a single transaction.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-medium text-slate-400 uppercase">Date:</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlotsCart([]); 
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => setShowCheckoutModal(true)}
                  disabled={selectedSlotsCart.length === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-lg ${selectedSlotsCart.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  <span>Checkout Cart</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{selectedSlotsCart.length}</span>
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => setShowAdminAddModal(true)}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Admin Multi-Book</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Badminton Courts (B1, B2)</span>
                  <p className="text-lg font-bold text-blue-400">${prices.badminton} <span className="text-xs text-slate-400 font-normal">/ hour</span></p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400 font-semibold text-xs">2 Courts Available</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Pickleball Courts (P1, P2)</span>
                  <p className="text-lg font-bold text-emerald-400">${prices.pickleball} <span className="text-xs text-slate-400 font-normal">/ hour</span></p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400 font-semibold text-xs">2 Courts Available</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-300">
                      <th className="p-4 font-semibold">Time Slot</th>
                      {courts.map(c => (
                        <th key={c.id} className="p-4 font-semibold">
                          {c.name} <span className="block text-[10px] text-slate-400 font-normal uppercase">(${prices[c.type]}/hr)</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {timeSlots.map(time => (
                      <tr key={time} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 text-sm font-medium text-slate-300 flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>{time}</span>
                        </td>
                        {courts.map(court => {
                          const booking = isSlotBooked(court.id, selectedDate, time);
                          const isSelectedInCart = selectedSlotsCart.some(s => s.courtId === court.id && s.time === time);

                          return (
                            <td key={court.id} className="p-4">
                              {booking ? (
                                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 text-xs">
                                  <span className="font-semibold text-rose-400 block">Booked</span>
                                  <span className="text-slate-400 truncate block mt-0.5">{booking.customer}</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => toggleSlotSelection(court.id, time)}
                                  className={`w-full border rounded-xl p-2.5 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${isSelectedInCart ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}
                                >
                                  {isSelectedInCart ? (
                                    <>
                                      <CheckSquare className="w-3.5 h-3.5" />
                                      <span>Selected</span>
                                    </>
                                  ) : (
                                    <>
                                      <Square className="w-3.5 h-3.5" />
                                      <span>Available (${prices[court.type]})</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS LEDGER */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{isAdmin ? 'All Facility Bookings' : 'My Bookings'}</h2>
                <p className="text-xs text-slate-400">Complete record of online and administrative court reservations.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-300">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Court</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {bookings
                      .filter(b => isAdmin || b.customer.includes(user.email))
                      .map(b => {
                        const courtObj = courts.find(c => c.id === b.courtId);
                        return (
                          <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-mono font-medium text-blue-400">{b.id}</td>
                            <td className="p-4 font-medium">{courtObj?.name || b.courtId}</td>
                            <td className="p-4 text-slate-300">{b.date} at {b.time}</td>
                            <td className="p-4 text-slate-300">{b.customer}</td>
                            <td className="p-4 font-semibold text-emerald-400">${b.amount}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {b.status !== 'Cancelled' && (
                                <button
                                  onClick={() => cancelBooking(b.id)}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRICING SETTINGS */}
        {activeTab === 'pricing' && isAdmin && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold">Dynamic Slot Pricing</h2>
                <p className="text-xs text-slate-400 mt-1">Set hourly rates for badminton and pickleball courts.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-2">Badminton Court Hourly Rate ($)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={prices.badminton}
                      onChange={(e) => setPrices({ ...prices, badminton: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-2">Pickleball Court Hourly Rate ($)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={prices.pickleball}
                      onChange={(e) => setPrices({ ...prices, pickleball: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXPENDITURE TRACKER */}
        {activeTab === 'expenses' && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold mb-1">Add Facility Expenditure</h2>
              <p className="text-xs text-slate-400 mb-6">Log facility expenses tied to specific dates.</p>

              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Court net repair & cleaning"
                    value={newExpDesc}
                    onChange={(e) => setNewExpDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newExpDate}
                    onChange={(e) => setNewExpDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-4 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30"
                  >
                    Add Expenditure Entry
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 font-bold text-sm">Logged Expenditure Records</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-300">
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 text-slate-300">{exp.date}</td>
                        <td className="p-4 font-medium">{exp.description}</td>
                        <td className="p-4 font-semibold text-rose-400">${exp.amount.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteExpense(exp.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 p-2 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCIAL REPORTS & P&L */}
        {activeTab === 'reports' && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-lg font-bold">Financial Reports & P&L Analysis</h2>
                <p className="text-xs text-slate-400">Income vs Expenditure period breakdown and net profit calculation.</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 uppercase font-medium">Period:</span>
                <select 
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="month">Current Month</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Income</span>
                  <h3 className="text-2xl font-bold text-emerald-400 mt-1">${totalIncome.toFixed(2)}</h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">{filteredBookings.length} bookings counted</span>
                </div>
                <div className="bg-emerald-500/10 p-3.5 rounded-2xl text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Expenditure</span>
                  <h3 className="text-2xl font-bold text-rose-400 mt-1">${totalExpense.toFixed(2)}</h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">{filteredExpenses.length} expense items</span>
                </div>
                <div className="bg-rose-500/10 p-3.5 rounded-2xl text-rose-400">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Net Profit / Loss</span>
                  <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                    ${netProfit.toFixed(2)}
                  </h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {netProfit >= 0 ? 'Net Gain Period' : 'Net Loss Period'}
                  </span>
                </div>
                <div className={`p-3.5 rounded-2xl ${netProfit >= 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <BarChart2 className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: CHECKOUT CART */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold">Confirm Multi-Slot Transaction</h3>
              <p className="text-xs text-slate-400 mt-1">Review all selected court slots for date: <span className="text-blue-400 font-semibold">{selectedDate}</span></p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-800">
              {selectedSlotsCart.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{item.courtName}</span>
                    <span className="text-slate-400">Time: {item.time}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-emerald-400">${item.amount}</span>
                    <button 
                      onClick={() => setSelectedSlotsCart(selectedSlotsCart.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4 px-1">
              <span className="text-sm font-medium text-slate-300">Total Combined Amount:</span>
              <span className="text-xl font-bold text-emerald-400">
                ${selectedSlotsCart.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
              </span>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl text-sm transition-all"
              >
                Continue Selecting
              </button>
              <button 
                onClick={handleCustomerMultiBook}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30"
              >
                Complete Payment ({selectedSlotsCart.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN MULTI-SLOT BOOKING */}
      {showAdminAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold">Admin Multi-Slot Booking Tool</h3>
              <p className="text-xs text-slate-400 mt-1">Select multiple slots from the calendar behind this modal, then assign them to a customer.</p>
            </div>

            <form onSubmit={handleAdminMultiBook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Customer Name / Email</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. David Warner"
                  value={adminCustomer}
                  onChange={(e) => setAdminCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Selected Slots Cart ({adminCart.length})</label>
                <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                  {adminCart.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2 text-center">No slots selected yet. Click availability buttons on the calendar to add slots.</p>
                  ) : (
                    adminCart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span>{item.courtName} ({item.time})</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-semibold">${item.amount}</span>
                          <button 
                            type="button" 
                            onClick={() => setAdminCart(adminCart.filter((_, i) => i !== idx))}
                            className="text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAdminAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={adminCart.length === 0}
                  className={`flex-1 font-medium py-3 rounded-xl text-sm transition-all shadow-lg ${adminCart.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  Book All ({adminCart.length}) Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
