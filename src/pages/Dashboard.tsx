import { useState } from 'react';
import { format } from 'date-fns';
import { Target, CheckCircle2, TrendingUp, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { HabitGrid } from '@/components/HabitGrid';
import { SleepTracker } from '@/components/SleepTracker';
import { CalendarView } from '@/components/CalendarView';
import { NotesSection } from '@/components/NotesSection';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types/habit';

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  const {
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
  } = useHabits();

  // Calculate stats
  const totalHabits = habits.length;
  const today = format(new Date(), 'yyyy-MM-dd');
  const completedToday = habits.filter((h) => h.completedDays.includes(today)).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Calculate streak (consecutive days with at least one habit completed)
  const calculateStreak = () => {
    if (habits.length === 0) return 0;
    let streak = 0;
    const date = new Date();
    while (true) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const anyCompleted = habits.some((h) => h.completedDays.includes(dateStr));
      if (!anyCompleted) break;
      streak++;
      date.setDate(date.getDate() - 1);
    }
    return streak;
  };

  const streak = calculateStreak();

  // Average sleep
  const avgSleep = sleepEntries.length > 0
    ? (sleepEntries.reduce((sum, e) => sum + e.hours, 0) / sleepEntries.length).toFixed(1)
    : '—';

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Your Habits
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-lg font-medium min-w-[150px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Track your daily habits and build consistency
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Active Habits"
            value={totalHabits}
            subtitle="habits being tracked"
            icon={Target}
          />
          <StatsCard
            title="Today's Progress"
            value={`${completedToday}/${totalHabits}`}
            subtitle={`${completionRate}% complete`}
            icon={CheckCircle2}
            trend={completionRate >= 80 ? 'up' : completionRate >= 50 ? 'neutral' : 'down'}
            trendValue={`${completionRate}%`}
          />
          <StatsCard
            title="Current Streak"
            value={`${streak} days`}
            subtitle="consecutive days"
            icon={TrendingUp}
            trend={streak >= 7 ? 'up' : streak >= 3 ? 'neutral' : 'down'}
          />
          <StatsCard
            title="Avg Sleep"
            value={`${avgSleep} hrs`}
            subtitle="this month"
            icon={Moon}
          />
        </div>

        {/* Main Grid */}
        <div className="space-y-6">
          <HabitGrid
            habits={habits}
            currentMonth={currentMonth}
            viewMode={viewMode}
            onToggleDay={toggleHabitDay}
            onAddHabit={addHabit}
            onUpdateHabit={updateHabit}
            onDeleteHabit={deleteHabit}
          />

          <SleepTracker
            sleepEntries={sleepEntries}
            currentMonth={currentMonth}
            onAddEntry={addSleepEntry}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CalendarView
              tasks={tasks}
              currentMonth={currentMonth}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onMonthChange={setCurrentMonth}
            />
            <NotesSection
              notes={notes}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
