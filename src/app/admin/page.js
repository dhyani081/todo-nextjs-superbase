'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProtectedRoute from '@/components/ProtectedRoute';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminPage() {
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorText, setErrorText] = useState('');

  // check logged-in user + role
  useEffect(() => {
    const loadProfileAndUsers = async () => {
      setErrorText('');

      // 1) get auth user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace('/auth/login');
        return;
      }

      // 2) get profile row
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileErr || !profile) {
        setErrorText('Profile not found for current user.');
        setLoadingProfile(false);
        return;
      }

      setCurrentProfile(profile);
      setLoadingProfile(false);

      // if not admin, send back to dashboard
      if (profile.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      // 3) load all users (profiles)
      const { data: allUsers, error: usersErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (usersErr) {
        setErrorText(usersErr.message);
      } else {
        setUsers(allUsers || []);
      }
      setLoadingUsers(false);
    };

    loadProfileAndUsers();
  }, [router]);

  const reloadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setErrorText(error.message);
    } else {
      setUsers(data || []);
    }
  };

  const handleToggleBlock = async (user) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !user.is_blocked })
      .eq('id', user.id);

    if (error) {
      setErrorText(error.message);
    } else {
      reloadUsers();
    }
  };

  const handleMakeAdmin = async (user) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id);

    if (error) {
      setErrorText(error.message);
    } else {
      reloadUsers();
    }
  };

  // NOTE: delete user properly needs server-side route with service-role key.
  // Here we just mark them blocked for now.
//   const handleSoftDelete = async (user) => {
//     const { error } = await supabase
//       .from('profiles')
//       .update({ is_blocked: true })
//       .eq('id', user.id);

//     if (error) {
//       setErrorText(error.message);
//     } else {
//       reloadUsers();
//     }
//   };

const handleHardDelete = async (user) => {
  setErrorText('');

  try {
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }), // profiles.id = auth.users.id
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorText(data.error || 'Failed to delete user');
    } else {
      // delete ke baad list refresh
      await reloadUsers();
    }
  } catch (err) {
    console.error(err);
    setErrorText('Network error while deleting user.');
  }
};

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading admin profile...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <Card className="w-full max-w-4xl p-4">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Panel</CardTitle>
              {currentProfile && (
                <p className="text-xs text-slate-400 mt-1">
                  Logged in as: <b>{currentProfile.email}</b> ({currentProfile.role})
                </p>
              )}
            </div>
            <Button
              variant="outline"
              className="text-white border-slate-500"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </CardHeader>

          <CardContent>
            {errorText && (
              <p className="text-xs text-red-400 mb-2">Error: {errorText}</p>
            )}

            {loadingUsers ? (
              <p className="text-sm text-slate-400">Loading users...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Blocked?</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.is_blocked ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-white"
                          onClick={() => handleToggleBlock(u)}
                        >
                          {u.is_blocked ? 'Unblock' : 'Block'}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleMakeAdmin(u)}
                        >
                          Make Admin
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-white"
                          onClick={() => handleHardDelete(u)}
                        >
                          Delete (Hard)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
