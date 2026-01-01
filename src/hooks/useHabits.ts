import { useState, useEffect } from 'react';
import { Habit, SleepEntry, CalendarTask, Note } from '@/types/habit';

const STORAGE_KEYS = {
  habits: 'habitTracker_habits',
  sleep: 'habitTracker_sleep',
  tasks: 'habitTracker_tasks',
  notes: 'habitTracker_notes',
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem(STORAGE_KEYS.habits);
    const savedSleep = localStorage.getItem(STORAGE_KEYS.sleep);
    const savedTasks = localStorage.getItem(STORAGE_KEYS.tasks);
    const savedNotes = localStorage.getItem(STORAGE_KEYS.notes);

    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedSleep) setSleepEntries(JSON.parse(savedSleep));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sleep, JSON.stringify(sleepEntries));
  }, [sleepEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  const addHabit = (name: string, color: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: new Date(),
      completedDays: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit))
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const toggleHabitDay = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const isCompleted = habit.completedDays.includes(date);
        return {
          ...habit,
          completedDays: isCompleted
            ? habit.completedDays.filter((d) => d !== date)
            : [...habit.completedDays, date],
        };
      })
    );
  };

  const addSleepEntry = (date: string, hours: number) => {
    setSleepEntries((prev) => {
      const existing = prev.findIndex((e) => e.date === date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { date, hours };
        return updated;
      }
      return [...prev, { date, hours }];
    });
  };

  const addTask = (title: string, date: string, color?: string) => {
    const newTask: CalendarTask = {
      id: crypto.randomUUID(),
      title,
      date,
      completed: false,
      color,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Omit<CalendarTask, 'id'>>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addNote = (content: string, date: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      date,
      createdAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = (id: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content } : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return {
    habits,
    sleepEntries,
    tasks,
    notes,
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
