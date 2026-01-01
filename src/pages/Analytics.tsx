import { useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, Award, Calendar, Target, Flame, Moon } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { StatsCard } from '@/components/StatsCard';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  'hsl(12 76% 61%)',
  'hsl(167 64% 45%)',
  'hsl(45 93% 58%)',
  'hsl(262 52% 55%)',
  'hsl(199 89% 48%)',
  'hsl(142 71% 45%)',
  'hsl(330 70% 55%)',
];

export default function Analytics() {
  const { habits, sleepEntries } = useHabits();

  // Calculate weekly completion data
  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const completed = habits.filter((h) => h.completedDays.includes(dateStr)).length;
      return {
        day: format(date, 'EEE'),
        date: format(date, 'MMM d'),
        completed,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
      };
    });
    return last7Days;
  }, [habits]);

  // Calculate monthly trend
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: now <= monthEnd ? now : monthEnd });

    return days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const completed = habits.filter((h) => h.completedDays.includes(dateStr)).length;
      return {
        date: format(date, 'd'),
        completed,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
      };
    });
  }, [habits]);

  // Calculate habit-specific stats
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const totalDays = habit.completedDays.length;
      const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
      const last30Count = habit.completedDays.filter((d) => last30Days.includes(d)).length;
      const completionRate = Math.round((last30Count / 30) * 100);

      return {
        name: habit.name,
        color: habit.color,
        totalDays,
        last30Count,
        completionRate,
      };
    });
  }, [habits]);

  // Sleep analytics
  const sleepData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = sleepEntries.find((e) => e.date === dateStr);
      return {
        day: format(date, 'EEE'),
        hours: entry?.hours || 0,
      };
    });
    return last7Days;
  }, [sleepEntries]);

  // Pie chart data for habit distribution
  const pieData = useMemo(() => {
    return habitStats.map((stat) => ({
      name: stat.name,
      value: stat.totalDays,
      color: stat.color,
    }));
  }, [habitStats]);

  // Calculate overall stats
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDays.length, 0);
  const avgCompletionRate = habitStats.length > 0
    ? Math.round(habitStats.reduce((sum, h) => sum + h.completionRate, 0) / habitStats.length)
    : 0;
  const bestHabit = habitStats.length > 0
    ? habitStats.reduce((best, h) => h.completionRate > best.completionRate ? h : best)
    : null;
  const avgSleep = sleepEntries.length > 0
    ? (sleepEntries.reduce((sum, e) => sum + e.hours, 0) / sleepEntries.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and identify patterns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Completions"
            value={totalCompletions}
            subtitle="all time"
            icon={Target}
          />
          <StatsCard
            title="Avg Completion Rate"
            value={`${avgCompletionRate}%`}
            subtitle="last 30 days"
            icon={TrendingUp}
            trend={avgCompletionRate >= 70 ? 'up' : avgCompletionRate >= 50 ? 'neutral' : 'down'}
          />
          <StatsCard
            title="Best Habit"
            value={bestHabit?.name || '—'}
            subtitle={bestHabit ? `${bestHabit.completionRate}% completion` : 'No data'}
            icon={Award}
          />
          <StatsCard
            title="Avg Sleep"
            value={`${avgSleep} hrs`}
            subtitle="tracked days"
            icon={Moon}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Progress */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Weekly Progress
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-muted-foreground text-xs" />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(12 76% 61%)"
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Monthly Trend
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-muted-foreground text-xs" />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="hsl(167 64% 45%)"
                    fill="hsl(167 64% 45% / 0.2)"
                    strokeWidth={2}
                    name="Completion %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Tracking */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Sleep Pattern
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-muted-foreground text-xs" />
                  <YAxis domain={[0, 10]} className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(262 52% 55%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(262 52% 55%)', strokeWidth: 2 }}
                    name="Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Habit Distribution */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Habit Distribution
            </h3>
            <div className="h-[300px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No habit data yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Habit Breakdown */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Habit Breakdown (Last 30 Days)
          </h3>
          {habitStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Add some habits to see your breakdown
            </p>
          ) : (
            <div className="space-y-4">
              {habitStats.map((stat, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="font-medium text-foreground">{stat.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {stat.last30Count}/30 days
                      </span>
                      <span className={cn(
                        'font-semibold',
                        stat.completionRate >= 70 ? 'text-success' :
                        stat.completionRate >= 50 ? 'text-warning' : 'text-destructive'
                      )}>
                        {stat.completionRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stat.completionRate}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
