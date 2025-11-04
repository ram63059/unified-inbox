'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Login failed' }));
        setError(data.error || 'Login failed');
        return;
      }

      
      
      // Login successful, redirect to inbox
      router.push('/dashboard/inbox');
      router.refresh();
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Unified Inbox
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage all your messages in one place
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="demo@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600"> Dont have an account? </span>
            <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign up
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded text-sm">
            <p className="font-medium text-blue-900 mb-1">Demo Account:</p>
            <p className="text-blue-700">Email: demo@example.com</p>
            <p className="text-blue-700">Password: password123</p>
          </div>
        </form>
      </div>
    </div>
  );
}