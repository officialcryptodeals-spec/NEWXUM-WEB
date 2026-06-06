import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi } from '@/lib/api';
import { Role } from '@/types';

export type ResponderType = 'medical' | 'security' | 'driver';

// Map old backend roles to new frontend role system
function mapToFrontendRole(backendRole: string): { role: Role; responderType?: ResponderType } {
  switch (backendRole) {
    case 'medical_officer': return { role: 'responder' as Role, responderType: 'medical' };
    case 'security_officer': return { role: 'responder' as Role, responderType: 'security' };
    case 'driver': return { role: 'responder' as Role, responderType: 'driver' };
    case 'admin': return { role: 'admin' };
    default: return { role: 'worshipper' };
  }
}

// Map demo email to mock user for offline demo mode
function getDemoUser(email: string, password: string) {
  const demos: Record<string, { id: string; name: string; email: string; role: string; responderType?: string }> = {
    'worshipper@example.com': { id: 'demo-worshipper', name: 'Adaeze Obi', email, role: 'worshipper' },
    'medical@example.com': { id: 'demo-medical', name: 'Dr. Kemi Adeyemi', email, role: 'medical_officer' },
    'security@example.com': { id: 'demo-security', name: 'Sgt. Chidi Okonkwo', email, role: 'security_officer' },
    'driver@example.com': { id: 'demo-driver', name: 'Musa Abdullahi', email, role: 'driver' },
    'admin@example.com': { id: 'demo-admin', name: 'HQ Commandant', email, role: 'admin' },
    // Existing test accounts
    'worshipper@test.com': { id: 'test-worshipper', name: 'Test Worshipper', email, role: 'worshipper' },
    'officer@test.com': { id: 'test-officer', name: 'Test Officer', email, role: 'security_officer' },
    'admin@test.com': { id: 'test-admin', name: 'Test Admin', email, role: 'admin' },
  };
  if (password === 'Password123!' || password === 'demo123' || password === 'demo@1234') {
    return demos[email] ?? null;
  }
  return null;
}

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      responderType?: ResponderType;
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    responderType?: ResponderType;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: Role;
    responderType?: ResponderType;
    userId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Demo mode: check hardcoded accounts first
        const demoUser = getDemoUser(credentials.email, credentials.password);
        if (demoUser) {
          const { role, responderType } = mapToFrontendRole(demoUser.role);
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role,
            responderType,
            accessToken: `demo-token-${demoUser.id}`,
            refreshToken: `demo-refresh-${demoUser.id}`,
          };
        }

        // Live API login
        try {
          const res = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!res.success || !res.data) return null;

          const { user, accessToken, refreshToken } = res.data as any;
          const { role, responderType } = mapToFrontendRole(user.role);
          return {
            id: user.id,
            name: user.fullName ?? user.name,
            email: user.email,
            role,
            responderType,
            accessToken,
            refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.responderType = user.responderType;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.responderType = token.responderType;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
