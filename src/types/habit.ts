export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  completedDays: string[]; // Array of date strings "YYYY-MM-DD"
}

export interface SleepEntry {
  date: string; // "YYYY-MM-DD"
  hours: number;
}

export interface CalendarTask {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  color?: string;
}

export interface Note {
  id: string;
  content: string;
  date: string;
  createdAt: Date;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';
