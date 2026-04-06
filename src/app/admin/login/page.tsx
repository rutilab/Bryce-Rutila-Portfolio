'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === 'admin_not_configured'
            ? 'Set ADMIN_SECRET (16+ chars) and ADMIN_PASSWORD in .env.local or Vercel, then restart dev or redeploy.'
            : 'Sign in failed.',
        );
        setLoading(false);
        return;
      }
      const dest = searchParams.get('from') || '/admin';
      router.replace(dest);
      router.refresh();
    } catch {
      setError('Network error.');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-xl font-semibold text-white">Analytics</h1>
      <p className="mb-8 max-w-sm text-center text-sm text-zinc-400">
        This area is not linked from the public site. Enter the admin password.
      </p>
      <form onSubmit={onSubmit} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
        {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center text-zinc-500">Loading…</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
