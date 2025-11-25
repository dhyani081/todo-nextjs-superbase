// 'use client';

// import { useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';

// export default function SignupPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [msg, setMsg] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSignup = async () => {
//     setMsg('');
//     setLoading(true);

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) {
//       setMsg(error.message);
//     } else {
//       setMsg('Signup successful! Check your email inbox for verification link.');
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <Card className="w-full max-w-md p-4">
//         <CardHeader>
//           <CardTitle className="text-center text-xl">Create account</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <Input
//             type="email"
//             placeholder="Email address"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />

//           <Input
//             type="password"
//             placeholder="Password (min 6 chars)"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           {msg && (
//             <p className="text-sm text-center text-red-500">
//               {msg}
//             </p>
//           )}

//           <Button
//             className="w-full"
//             onClick={handleSignup}
//             disabled={loading}
//           >
//             {loading ? 'Signing up...' : 'Sign Up'}
//           </Button>

//           <button
//           variant="outline"
//           type='button'
//           className='w-full mt-2 text-white'
//           onClick={()=> router.push('/auth/login')}>
//             Login
//           </button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


'use client';

import { useState } from 'react';
import Link from 'next/link';               // ⭐ NEW: Link import
import { supabase } from '@/lib/supabaseClient';

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
      setMsg('Signup successful! Now you can login.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md border border-slate-700 rounded-lg p-4">
        <h1 className="text-xl font-semibold text-center mb-4">
          Create account
        </h1>

        {/* Email */}
        <input
          type="email"
          className="w-full mb-2 px-3 py-2 rounded bg-slate-900 border border-slate-700"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          className="w-full mb-2 px-3 py-2 rounded bg-slate-900 border border-slate-700"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Message (error / success) */}
        {msg && (
          <p className="text-xs text-center text-red-400 mb-2">
            {msg}
          </p>
        )}

        {/* 🔹 Signup button */}
        <button
          type="button"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded py-2 mb-2"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        {/* ⭐ NEW: LOGIN BUTTON USING LINK (YEHI PART IMPORTANT HAI) */}
        {/* Link se wrap kiya hai taaki click pe /auth/login pe jaye */}
        <Link href="/auth/login" className="block w-full mt-2">
          <button
            type="button"
            className="w-full border border-slate-600 rounded py-2 text-white hover:bg-slate-800"
          >
            Login
          </button>
        </Link>
        {/* ⭐ NEW PART END */}
      </div>
    </div>
  );
}
