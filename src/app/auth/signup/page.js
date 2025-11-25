'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setMsg('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg('Signup successful! Check your email inbox for verification link.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle className="text-center text-xl">Create account</CardTitle>
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
            placeholder="Password (min 6 chars)"
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
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>

          <button
          variant="outline"
          className='w-full mt-2 text-white'
          onClick={()=> router.push('/auth/login')}>
            Login
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
