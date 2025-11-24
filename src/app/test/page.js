// 'useClient';

// import {useState, useEffect} from 'react';
// import { Supabase } from '@/lib/supabaseClient';

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPage() {
  const [todos, setTodos] = useState([]);
  const [errorText, setErrorText] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error(error);
        setErrorText(error.message);
      } else {
        setTodos(data || []);
      }
      setLoading(false);
    };

    loadTodos();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading todos from Supabase...</div>;
  }

  if (errorText) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        Error while fetching todos: {errorText}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Todos (Test)</h1>
      {todos.length === 0 ? (
        <p>No todos found.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.id}. {todo.task} - {todo.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
