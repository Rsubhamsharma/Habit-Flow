import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Habit, SleepEntry, CalendarTask, Note } from '@/types/habit';
import { toast } from 'sonner';

export function useHabitsDb() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track if initial load is complete to prevent animation on first render
  const initialLoadComplete = useRef(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setSleepEntries([]);
      setTasks([]);
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch habits with completions
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      // Map completions to habits
      const habitsWithCompletions: Habit[] = (habitsData || []).map(h => ({
        id: h.id,
        name: h.name,
        color: h.color,
        createdAt: new Date(h.created_at),
        completedDays: (completionsData || [])
          .filter(c => c.habit_id === h.id)
          .map(c => c.date),
      }));

      setHabits(habitsWithCompletions);

      // Fetch sleep entries
      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', user.id);

      if (sleepError) throw sleepError;

      setSleepEntries((sleepData || []).map(s => ({
        date: s.date,
        hours: Number(s.hours),
      })));

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      setTasks((tasksData || []).map(t => ({
        id: t.id,
        title: t.title,
        date: t.date,
        completed: t.completed,
        color: t.color || undefined,
      })));

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      setNotes((notesData || []).map(n => ({
        id: n.id,
        content: n.content,
        date: n.date,
        createdAt: new Date(n.created_at),
      })));

      initialLoadComplete.current = true;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Habit operations
  const addHabit = async (name: string, color: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .insert({ name, color, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add habit');
      return;
    }

    // Add to local state without animation trigger
    setHabits(prev => [...prev, {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: new Date(data.created_at),
      completedDays: [],
    }]);
    
    toast.success('Habit added!');
  };

  const updateHabit = async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    if (!user) return;

    const { error } = await supabase
      .from('habits')
      .update({ name: updates.name, color: updates.color })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update habit');
      return;
    }

    setHabits(prev =>
      prev.map(h => h.id === id ? { ...h, ...updates } : h)
    );
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete habit');
      return;
    }

    setHabits(prev => prev.filter(h => h.id !== id));
    toast.success('Habit deleted');
  };

  const toggleHabitDay = async (habitId: string, date: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDays.includes(date);

    if (isCompleted) {
      // Remove completion
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('date', date)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update');
        return;
      }
    } else {
      // Add completion
      const { error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, date, user_id: user.id });

      if (error) {
        toast.error('Failed to update');
        return;
      }
    }

    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          completedDays: isCompleted
            ? h.completedDays.filter(d => d !== date)
            : [...h.completedDays, date],
        };
      })
    );
  };

  // Sleep operations
  const addSleepEntry = async (date: string, hours: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('sleep_entries')
      .upsert({ date, hours, user_id: user.id }, { onConflict: 'user_id,date' });

    if (error) {
      toast.error('Failed to save sleep entry');
      return;
    }

    setSleepEntries(prev => {
      const existing = prev.findIndex(e => e.date === date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { date, hours };
        return updated;
      }
      return [...prev, { date, hours }];
    });
  };

  // Task operations
  const addTask = async (title: string, date: string, color?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, date, color, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add task');
      return;
    }

    setTasks(prev => [...prev, {
      id: data.id,
      title: data.title,
      date: data.date,
      completed: data.completed,
      color: data.color || undefined,
    }]);
  };

  const updateTask = async (id: string, updates: Partial<Omit<CalendarTask, 'id'>>) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update task');
      return;
    }

    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete task');
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Note operations
  const addNote = async (content: string, date: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notes')
      .insert({ content, date, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add note');
      return;
    }

    setNotes(prev => [{
      id: data.id,
      content: data.content,
      date: data.date,
      createdAt: new Date(data.created_at),
    }, ...prev]);
  };

  const updateNote = async (id: string, content: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update note');
      return;
    }

    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, content } : n)
    );
  };

  const deleteNote = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete note');
      return;
    }

    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return {
    habits,
    sleepEntries,
    tasks,
    notes,
    loading,
    initialLoadComplete: initialLoadComplete.current,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDay,
    addSleepEntry,
    addTask,
    updateTask,
    deleteTask,
    addNote,
    updateNote,
    deleteNote,
  };
}
