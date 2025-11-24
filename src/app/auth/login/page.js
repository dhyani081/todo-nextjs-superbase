'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

     if (error) {
  setMsg(error.message);
} else {
  // after login, check block status from profiles table
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_blocked')
    .eq('id', userData.user.id)
    .single();

  if (profile?.is_blocked) {
    await supabase.auth.signOut();
    setMsg("Your account is blocked by Admin.");
    return;
  }

  setMsg('Login successful! Redirecting...');
  router.push('/dashboard');
}
    } catch (err) {
      console.error('Login failed (network):', err);
      setMsg('Network error: failed to reach Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle className="text-center text-xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {msg && (
            <p className="text-sm text-center text-red-500">
              {msg}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
