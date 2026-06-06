import { redirect } from 'next/navigation';

// Re-export the existing login page under /auth/login to separate route
export default function AuthLoginWrapper() {
  redirect('/login');
}
