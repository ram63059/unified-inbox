import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function HomePage() {
  // Check if user is logged in
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Redirect based on authentication status
  if (session) {
    redirect('/dashboard/inbox');
  } else {
    redirect('/login');
  }
}