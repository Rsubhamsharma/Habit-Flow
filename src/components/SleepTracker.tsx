import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { SleepEntry } from '@/types/habit';
import { cn } from '@/lib/utils';

interface SleepTrackerProps {
  sleepEntries: SleepEntry[];
  currentMonth: Date;
  onAddEntry: (date: string, hours: number) => void;
}

const SLEEP_HOURS = [9, 8, 7, 6, 5];

export function SleepTracker({ sleepEntries, currentMonth, onAddEntry }: SleepTrackerProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSleepForDate = (date: string) => {
    return sleepEntries.find((e) => e.date === date)?.hours;
  };

  const getColorForHours = (hours: number) => {
    if (hours >= 8) return 'bg-success';
    if (hours >= 7) return 'bg-accent';
    if (hours >= 6) return 'bg-warning';
    return 'bg-destructive/70';
  };

  return (
    <div className="glass-card rounded-2xl p-6 overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-lg font-display font-semibold text-foreground">Sleep Tracker</h3>
        <p className="text-sm text-muted-foreground">Track your sleep hours daily</p>
      </div>

      <div className="min-w-[900px]">
        {/* Days header */}
        <div className="grid grid-cols-[80px_repeat(31,1fr)] gap-1 mb-2">
          <div className="text-sm font-medium text-muted-foreground">Sleep</div>
          {daysInMonth.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'text-center text-xs font-medium',
                isToday(day) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {format(day, 'd')}
            </div>
          ))}
          {Array.from({ length: 31 - daysInMonth.length }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        </div>

        {/* Sleep hour rows */}
        {SLEEP_HOURS.map((hours) => (
          <div
            key={hours}
            className="grid grid-cols-[80px_repeat(31,1fr)] gap-1 mb-1 items-center"
          >
            <div className="text-xs font-medium text-muted-foreground">
              {hours} hrs
            </div>
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const sleepHours = getSleepForDate(dateStr);
              const isSelected = sleepHours === hours;
              return (
                <button
                  key={dateStr}
                  onClick={() => onAddEntry(dateStr, hours)}
                  className={cn(
                    'w-full h-5 rounded-sm border border-border/50 cursor-pointer transition-all duration-200',
                    isSelected && getColorForHours(hours),
                    !isSelected && 'hover:bg-muted',
                    isToday(day) && !isSelected && 'border-primary/50'
                  )}
                />
              );
            })}
            {Array.from({ length: 31 - daysInMonth.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
