'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm, RegisterForm } from '@/components/shared/LoginForm';

export default function ResponderLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const demoAccounts = [
    { name: 'Officer Obenga', role: 'Security (Pending Vetting)', email: 'obenga@redemption.city', password: 'demo123' },
    { name: 'Dr. Stella Ola', role: 'Medical (Approved)', email: 'stella@redemption.city', password: 'demo123' },
  ];

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    if (emailInput && passwordInput) {
      emailInput.value = account.email;
      passwordInput.value = account.password;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10"
      >
        {/* Left Side - Branding */}
        <motion.div
          variants={itemVariants}
          className="hidden lg:flex flex-col justify-between"
        >
          <div className="backdrop-blur-xl bg-gradient-to-br from-[#0047AB]/80 to-[#003580]/80 rounded-3xl p-12 border border-white/20 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="text-sm font-semibold text-blue-100/70 mb-2">NEXUM RESPONDER PORTAL</div>
              <h1 className="text-5xl font-bold text-white mb-3">Operations Hub</h1>
              <p className="text-blue-100/80 text-base">Real-time emergency response coordination</p>
            </motion.div>

            <motion.div
              className="space-y-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[
                'Receive dispatch alerts instantly',
                'Manage incident response',
                'Coordinate missing persons',
                'Secure officer communication',
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className="w-2 h-2 bg-[#FFA500] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-blue-100/90">{feature}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="border-t border-blue-400/30 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-blue-100/70">Empowering emergency responders with real-time intelligence</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-center"
        >
          {/* Glass morphism card */}
          <motion.div
            className="backdrop-blur-xl bg-white/80 rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl"
            layoutId="auth-card"
          >
            {/* Header */}
            <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0047AB] to-[#003580] bg-clip-text text-transparent mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-600">
                {isSignUp ? 'Join the Operations Hub' : 'Sign in to your Operations Hub account'}
              </p>
            </motion.div>

            {/* Form Toggle Tabs */}
            <motion.div className="flex gap-2 mb-8 bg-slate-100/50 p-1 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              {['Sign In', 'Sign Up'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setIsSignUp(tab === 'Sign Up')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    (tab === 'Sign In' && !isSignUp) || (tab === 'Sign Up' && isSignUp)
                      ? 'bg-[#0047AB] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab}
                </motion.button>
              ))}
            </motion.div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {isSignUp ? <RegisterForm role="responder" /> : <LoginForm role="responder" />}
              </motion.div>
            </AnimatePresence>

            {/* Demo Accounts */}
            {!isSignUp && (
              <motion.div
                className="mt-8 pt-8 border-t border-slate-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs font-semibold text-slate-600 mb-3 uppercase">⚡ Demo Bypass</p>
                <div className="space-y-2">
                  {demoAccounts.map((account) => (
                    <motion.button
                      key={account.email}
                      onClick={() => handleDemoLogin(account)}
                      className="w-full text-left p-3 rounded-lg bg-amber-50/50 hover:bg-amber-100/50 border border-amber-200/50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="font-semibold text-sm text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-600">{account.role}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
