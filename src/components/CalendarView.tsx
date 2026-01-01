import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Plus, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarTask } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: CalendarTask[];
  currentMonth: Date;
  onAddTask: (title: string, date: string, color?: string) => void;
  onUpdateTask: (id: string, updates: Partial<Omit<CalendarTask, 'id'>>) => void;
  onDeleteTask: (id: string) => void;
  onMonthChange: (date: Date) => void;
}

const TASK_COLORS = [
  'hsl(12 76% 61%)',
  'hsl(167 64% 45%)',
  'hsl(45 93% 58%)',
  'hsl(262 52% 55%)',
  'hsl(199 89% 48%)',
];

export function CalendarView({
  tasks,
  currentMonth,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMonthChange,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColor, setNewTaskColor] = useState(TASK_COLORS[0]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => task.date === dateStr);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() && selectedDate) {
      onAddTask(newTaskTitle.trim(), format(selectedDate, 'yyyy-MM-dd'), newTaskColor);
      setNewTaskTitle('');
      setNewTaskColor(TASK_COLORS[0]);
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-foreground">Calendar</h2>
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'aspect-square p-1 rounded-lg border border-transparent transition-all duration-200 relative',
                isCurrentMonth ? 'hover:bg-muted' : 'opacity-40',
                isToday(day) && 'border-primary bg-primary/5',
                selectedDate && isSameDay(day, selectedDate) && 'bg-primary/10 border-primary'
              )}
            >
              <span className={cn(
                'text-sm font-medium',
                isToday(day) && 'text-primary'
              )}>
                {format(day, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: task.color || TASK_COLORS[0] }}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Add new task */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="bg-background border-border flex-1"
              />
              <Button onClick={handleAddTask} size="icon" className="bg-gradient-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Color picker */}
            <div className="flex gap-2">
              {TASK_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    newTaskColor === color && 'ring-2 ring-offset-2 ring-offset-card ring-primary'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTaskColor(color)}
                />
              ))}
            </div>

            {/* Tasks list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedDateTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks for this day
                </p>
              ) : (
                selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg bg-background/50 group',
                      task.completed && 'opacity-60'
                    )}
                  >
                    <button
                      onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        task.completed ? 'border-success bg-success' : 'border-muted-foreground'
                      )}
                      style={!task.completed ? { borderColor: task.color } : undefined}
                    >
                      {task.completed && <Check className="w-3 h-3 text-success-foreground" />}
                    </button>
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        task.completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
