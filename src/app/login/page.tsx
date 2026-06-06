'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, ShieldCheck, Truck, Crown, Eye, EyeOff, ArrowLeft, CircleAlert as AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type TopRole = 'worshipper' | 'responder' | 'admin';
type ResponderType = 'medical' | 'security' | 'driver';

const DEMO_ACCOUNTS: Record<string, { email: string; password: string }> = {
  worshipper: { email: 'worshipper@example.com', password: 'Password123!' },
  medical: { email: 'medical@example.com', password: 'Password123!' },
  security: { email: 'security@example.com', password: 'Password123!' },
  driver: { email: 'driver@example.com', password: 'Password123!' },
  admin: { email: 'admin@example.com', password: 'Password123!' },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '';

  const [step, setStep] = useState<'role' | 'responder-type' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<TopRole | null>(null);
  const [responderType, setResponderType] = useState<ResponderType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function getDashboardPath(role: TopRole, type?: ResponderType) {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'worshipper') return '/dashboard/worshipper';
    if (role === 'responder') {
      if (type === 'medical') return '/dashboard/medical';
      if (type === 'security') return '/dashboard/security';
      if (type === 'driver') return '/dashboard/driver';
    }
    return '/dashboard/worshipper';
  }

  function handleRoleSelect(role: TopRole) {
    setSelectedRole(role);
    setError('');
    if (role === 'responder') {
      setStep('responder-type');
    } else {
      const key = role === 'worshipper' ? 'worshipper' : 'admin';
      const demo = DEMO_ACCOUNTS[key];
      setEmail(demo.email);
      setPassword(demo.password);
      setStep('form');
    }
  }

  function handleResponderTypeSelect(type: ResponderType) {
    setResponderType(type);
    setStep('form');
    const demo = DEMO_ACCOUNTS[type];
    if (demo) { setEmail(demo.email); setPassword(demo.password); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password. Use the demo credentials shown below.');
      return;
    }

    toast.success('Welcome back!');
    const dest = callbackUrl || getDashboardPath(selectedRole!, responderType ?? undefined);
    router.push(dest);
    router.refresh();
  }

  function getFormTitle() {
    if (selectedRole === 'worshipper') return 'Worshipper Sign In';
    if (selectedRole === 'admin') return 'Administrator Sign In';
    if (selectedRole === 'responder') {
      if (responderType === 'medical') return 'Medical Officer Sign In';
      if (responderType === 'security') return 'Security Officer Sign In';
      if (responderType === 'driver') return 'Shuttle Driver Sign In';
    }
    return 'Sign In';
  }

  function getDemoAccount() {
    if (selectedRole === 'worshipper') return DEMO_ACCOUNTS['worshipper'];
    if (selectedRole === 'admin') return DEMO_ACCOUNTS['admin'];
    if (responderType) return DEMO_ACCOUNTS[responderType];
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0B1F4F] to-[#1B3A6B] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold">Nexum</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            RCCG Camp<br />Operations<br />Platform
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
            Real-time emergency dispatch, missing persons coordination, transportation management, and command-center oversight.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Peak Worshippers', value: '5M+' },
            { label: 'Dispatch Latency', value: '3s' },
            { label: 'Camp Area', value: '2,500 ha' },
            { label: 'Operations', value: '24/7' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-blue-300 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white min-h-screen overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Shield className="h-6 w-6 text-[#1B3A6B]" />
            <span className="font-bold text-[#1B3A6B] text-lg">Nexum</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 'role' && (
              <motion.div key="role"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                  <p className="text-slate-500">Select your role to continue</p>
                </div>
                <div className="space-y-3">
                  <RoleCard icon={<div className="text-3xl">🙏</div>} title="Worshipper"
                    description="Report emergencies, find services, book accommodation"
                    color="blue" onClick={() => handleRoleSelect('worshipper')} />
                  <RoleCard icon={<div className="text-3xl">🚑</div>} title="Responder"
                    description="Medical officers, security officers & shuttle drivers"
                    color="red" onClick={() => handleRoleSelect('responder')} />
                  <RoleCard icon={<Crown className="h-8 w-8 text-amber-600" />} title="Administrator"
                    description="Command center and full platform oversight"
                    color="amber" onClick={() => handleRoleSelect('admin')} />
                </div>
                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Demo Credentials (all use Password123!)</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p><span className="font-medium">Worshipper:</span> worshipper@example.com</p>
                    <p><span className="font-medium">Medical:</span> medical@example.com</p>
                    <p><span className="font-medium">Security:</span> security@example.com</p>
                    <p><span className="font-medium">Driver:</span> driver@example.com</p>
                    <p><span className="font-medium">Admin:</span> admin@example.com</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'responder-type' && (
              <motion.div key="responder-type"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <button onClick={() => setStep('role')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back to role selection
                </button>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Responder Access</h2>
                  <p className="text-slate-500">Select your operational specialization</p>
                </div>
                <div className="space-y-3">
                  <ResponderTypeCard
                    icon={<Heart className="h-7 w-7 text-red-500" />}
                    title="Medical Officer" description="Emergency dispatch, triage, patient care"
                    bgColor="bg-red-50" borderColor="border-red-200"
                    onClick={() => handleResponderTypeSelect('medical')} />
                  <ResponderTypeCard
                    icon={<ShieldCheck className="h-7 w-7 text-blue-600" />}
                    title="Security Officer" description="Incidents, missing persons, patrol management"
                    bgColor="bg-blue-50" borderColor="border-blue-200"
                    onClick={() => handleResponderTypeSelect('security')} />
                  <ResponderTypeCard
                    icon={<Truck className="h-7 w-7 text-emerald-600" />}
                    title="Shuttle Driver" description="Pickup requests, GPS navigation, routing"
                    bgColor="bg-emerald-50" borderColor="border-emerald-200"
                    onClick={() => handleResponderTypeSelect('driver')} />
                </div>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div key="form"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <button onClick={() => {
                  setError('');
                  setStep(selectedRole === 'responder' ? 'responder-type' : 'role');
                }} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">{getFormTitle()}</h2>
                  <p className="text-slate-500 text-sm">Credentials pre-filled for demo</p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      required placeholder="you@example.com"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent transition focus:bg-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full h-12 bg-[#1B3A6B] hover:bg-[#2563EB] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm mt-2">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : 'Sign In'}
                  </button>
                </form>

                {getDemoAccount() && (
                  <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Demo Account</p>
                    <p className="text-xs text-amber-700 font-mono">{getDemoAccount()!.email}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, description, color, onClick }: {
  icon: React.ReactNode; title: string; description: string;
  color: 'blue' | 'red' | 'amber'; onClick: () => void;
}) {
  const styles = {
    blue: 'border-blue-200 hover:border-blue-500 hover:bg-blue-50',
    red: 'border-red-200 hover:border-red-500 hover:bg-red-50',
    amber: 'border-amber-200 hover:border-amber-500 hover:bg-amber-50',
  };
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${styles[color]} transition-all text-left group`}>
      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500 mt-0.5">{description}</div>
      </div>
      <div className="text-slate-400 group-hover:translate-x-1 transition-transform text-lg">›</div>
    </button>
  );
}

function ResponderTypeCard({ icon, title, description, bgColor, borderColor, onClick }: {
  icon: React.ReactNode; title: string; description: string;
  bgColor: string; borderColor: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${borderColor} ${bgColor} hover:opacity-90 active:scale-[0.99] transition-all text-left group`}>
      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-600 mt-0.5">{description}</div>
      </div>
      <div className="text-slate-400 group-hover:translate-x-1 transition-transform text-lg">›</div>
    </button>
  );
}
