'use client';
export const dynamic = 'force-dynamic'; // always render on server per request
export const fetchCache = 'force-no-store'; // no static caching, pure SSR


import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProtectedRoute from '@/components/ProtectedRoute';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

/**
 * DashboardPage
 * - Protected route (sirf logged-in user)
 * - User ke hisaab se todos load, add, update, delete
 * - 3 tabs: Today / Completed / Pending
 */
export default function DashboardPage() {
  const router = useRouter();

  // current logged-in user ka data (Supabase Auth se)
  const [user, setUser] = useState(null);

  // todos list + loading / error state
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [todoError, setTodoError] = useState('');

  // naya todo add karne ke liye input state
  const [newTask, setNewTask] = useState('');
  const [adding, setAdding] = useState(false);

  // kaunsa tab active hai: today / completed / pending
  const [tab, setTab] = useState('today');

  /**
   * Step 1: User + uske todos load karo
   * - pehle Supabase se current user nikalte hain
   * - phir us user ke todos (user_id = user.id) fetch karte hain
   */
  useEffect(() => {
    const getUserAndTodos = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user ?? null;
      setUser(currentUser);

      if (!currentUser) return; // agar user hi nahi, kuch mat karo

      await loadTodos(currentUser.id);
    };

    getUserAndTodos();
  }, []);

  /**
   * Ye function given userId ke hisaab se todos fetch karta hai.
   * - sirf us user ke todos dikhayenge (`eq('user_id', userId)`)
   */
  const loadTodos = async (userId) => {
    if (!userId) return;

    setLoadingTodos(true);
    setTodoError('');

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId) // IMPORTANT: per-user filter
      .order('id', { ascending: true });

    if (error) {
      console.error(error);
      setTodoError(error.message);
    } else {
      setTodos(data || []);
    }

    setLoadingTodos(false);
  };

  /**
   * Naya todo add karega
   * - blank input pe kuch nahi karega
   * - "Not started" status se add hoga
   * - current user ka user_id bhi save hoga
   */
  const handleAddTodo = async () => {
    if (!newTask.trim() || !user) return;

    setAdding(true);
    setTodoError('');

    const { error } = await supabase.from('todos').insert({
      task: newTask.trim(),
      status: 'Not started',
      user_id: user.id, // per-user todo
    });

    if (error) {
      console.error(error);
      setTodoError(error.message);
    } else {
      setNewTask('');
      await loadTodos(user.id);
    }

    setAdding(false);
  };

  /**
   * Complete <-> Not started toggle karega
   * - button se todo pass aata hai
   * - status flip karke DB me update
   */
  const handleToggleStatus = async (todo) => {
    if (!user) return;

    const nextStatus = todo.status === 'Complete' ? 'Not started' : 'Complete';

    const { error } = await supabase
      .from('todos')
      .update({ status: nextStatus })
      .eq('id', todo.id)
      .eq('user_id', user.id); // safety: sirf apna hi todo

    if (error) {
      console.error(error);
      setTodoError(error.message);
    } else {
      await loadTodos(user.id);
    }
  };

  /**
   * Todo delete karega
   */
  const handleDelete = async (id) => {
    if (!user) return;

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // safety

    if (error) {
      console.error(error);
      setTodoError(error.message);
    } else {
      await loadTodos(user.id);
    }
  };

  /**
   * Logout button
   * - Supabase se signOut
   * - Login page pe redirect
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  /**
   * Tabs ke liye filtered lists
   * - Today: abhi ke liye all todos (date column nahi hai)
   * - Completed: status === 'Complete'
   * - Pending: status !== 'Complete'
   */
  const { todayTodos, completedTodos, pendingTodos } = useMemo(() => {
    const completed = todos.filter((t) => t.status === 'Complete');
    const pending = todos.filter((t) => t.status !== 'Complete');
    const today = todos; // future me yaha date filter laga sakte ho

    return {
      todayTodos: today,
      completedTodos: completed,
      pendingTodos: pending,
    };
  }, [todos]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Card className="w-full max-w-3xl p-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Todo Dashboard</CardTitle>
              {user && (
                <p className="text-xs text-slate-400 mt-1">
                  Logged in as:{' '}
                  <span className="font-semibold">{user.email}</span>
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* -------- Add Todo Form -------- */}
            <div className="flex gap-2">
              <Input
                placeholder="New todo task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <Button
                onClick={handleAddTodo}
                disabled={adding || !newTask.trim()}
              >
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </div>

            {/* Error message agar koi issue aya ho */}
            {todoError && (
              <p className="text-xs text-red-400">Error: {todoError}</p>
            )}

            {/* -------- Tabs -------- */}
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="today">Today&apos;s Todos</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

              {/* Today */}
              <TabsContent value="today">
                <TodoList
                  title="Today&apos;s Todos"
                  loading={loadingTodos}
                  todos={todayTodos}
                  onToggle={handleToggleStatus}
                  onDelete={handleDelete}
                />
              </TabsContent>

              {/* Completed */}
              <TabsContent value="completed">
                <TodoList
                  title="Completed Todos"
                  loading={loadingTodos}
                  todos={completedTodos}
                  onToggle={handleToggleStatus}
                  onDelete={handleDelete}
                />
              </TabsContent>

              {/* Pending */}
              <TabsContent value="pending">
                <TodoList
                  title="Pending Todos"
                  loading={loadingTodos}
                  todos={pendingTodos}
                  onToggle={handleToggleStatus}
                  onDelete={handleDelete}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

/**
 * Reusable TodoList component
 * - same UI 3 tabs ke liye use kar rahe hain
 */
function TodoList({ title, loading, todos, onToggle, onDelete }) {
  if (loading) {
    return <p className="text-sm text-slate-400">Loading todos...</p>;
  }

  if (!todos || todos.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No todos found for this category.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center justify-between border border-slate-800 rounded-md px-3 py-2"
        >
          <div>
            <p
              className={
                'text-sm ' +
                (todo.status === 'Complete'
                  ? 'line-through text-slate-500'
                  : '')
              }
            >
              {todo.task}
            </p>
            <p className="text-[11px] text-slate-500">
              Status: <span className="font-mono">{todo.status}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onToggle(todo)}>
              {todo.status === 'Complete' ? 'Mark Pending' : 'Mark Complete'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(todo.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
