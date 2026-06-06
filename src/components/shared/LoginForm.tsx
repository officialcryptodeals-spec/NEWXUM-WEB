'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Label, Spinner } from '@/components/ui';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Role } from '@/types';

const ROLE_HOME: Record<Role, string> = {
  worshipper: '/dashboard/worshipper',
  responder: '/dashboard/medical',
  medical_officer: '/dashboard/medical',
  security_officer: '/dashboard/security',
  driver: '/dashboard/driver',
  admin: '/dashboard/admin',
  host:  '/host/properties',
};

// ── Login Form ────────────────────────────────────────────────
export function LoginForm({
  callbackUrl,
  error,
  role,
}: {
  callbackUrl?: string;
  error?: string;
  role?: 'worshipper' | 'responder' | 'admin';
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Invalid email or password');
      setLoading(false);
      return;
    }

    toast.success('Welcome back!');
    router.push(callbackUrl ?? '/');
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-5">Sign In</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Authentication failed. Please try again.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1 block">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required autoFocus />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Register Form ─────────────────────────────────────────────
export function RegisterForm({ role = 'worshipper' }: { role?: 'worshipper' | 'responder' | 'admin' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', emergencyContactName: '', emergencyContactPhone: '', estateOrZone: '',
  });

  const roleRedirects: Record<string, string> = {
    worshipper: '/worshipper/bookings',
    responder: '/responder',
    admin: '/admin/dashboard',
  };

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    const res = await authApi.register(form);
    if (!res.success) {
      toast.error(res.error?.message ?? 'Registration failed');
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      toast.success('Account created! Welcome to Nexum.');
      router.push(roleRedirects[role] || '/worshipper/bookings');
    } else {
      router.push(`/login/${role}`);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-5">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="mb-1 block">Full Name</Label>
              <Input value={form.fullName} onChange={set('fullName')}
                placeholder="Your Full Name" required />
            </div>
            <div className="col-span-2">
              <Label className="mb-1 block">Email</Label>
              <Input type="email" value={form.email} onChange={set('email')}
                placeholder="your@email.com" required />
            </div>
            <div>
              <Label className="mb-1 block">Password</Label>
              <Input type="password" value={form.password} onChange={set('password')}
                placeholder="••••••••" required minLength={8} />
            </div>
            <div>
              <Label className="mb-1 block">Confirm Password</Label>
              <Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="••••••••" required />
            </div>
            <div className="col-span-2">
              <Label className="mb-1 block">Phone Number</Label>
              <Input value={form.phoneNumber} onChange={set('phoneNumber')}
                placeholder="+234..." />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Emergency contact — for use if you are incapacitated at camp
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Contact Name</Label>
                <Input value={form.emergencyContactName} onChange={set('emergencyContactName')}
                  placeholder="Contact full name" />
              </div>
              <div>
                <Label className="mb-1 block">Contact Phone</Label>
                <Input value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')}
                  placeholder="+234..." />
              </div>
            </div>
            <div className="mt-3">
              <Label className="mb-1 block">Estate / Zone (optional)</Label>
              <Input value={form.estateOrZone} onChange={set('estateOrZone')}
                placeholder="Your estate or zone" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : 'Create Account'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href={`/login/${role}`} className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
