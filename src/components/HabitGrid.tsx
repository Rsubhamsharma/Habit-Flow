import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Check, Pencil, Trash2, Plus } from 'lucide-react';
import { Habit, ViewMode } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HabitGridProps {
  habits: Habit[];
  currentMonth: Date;
  viewMode: ViewMode;
  onToggleDay: (habitId: string, date: string) => void;
  onAddHabit: (name: string, color: string) => void;
  onUpdateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  onDeleteHabit: (id: string) => void;
}

const HABIT_COLORS = [
  'hsl(12 76% 61%)',
  'hsl(167 64% 45%)',
  'hsl(45 93% 58%)',
  'hsl(262 52% 55%)',
  'hsl(199 89% 48%)',
  'hsl(142 71% 45%)',
  'hsl(330 70% 55%)',
];

export function HabitGrid({
  habits,
  currentMonth,
  viewMode,
  onToggleDay,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}: HabitGridProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState(HABIT_COLORS[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAddHabit(newHabitName.trim(), newHabitColor);
      setNewHabitName('');
      setNewHabitColor(HABIT_COLORS[0]);
      setIsAddDialogOpen(false);
    }
  };

  const handleEditHabit = () => {
    if (editingHabit && editName.trim()) {
      onUpdateHabit(editingHabit.id, { name: editName.trim(), color: editColor });
      setEditingHabit(null);
    }
  };

  const startEditing = (habit: Habit) => {
    setEditingHabit(habit);
    setEditName(habit.name);
    setEditColor(habit.color);
  };

  return (
    <div className="glass-card rounded-2xl p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Small habits. Big change.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Habit name..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                className="bg-background border-border"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        newHabitColor === color && 'ring-2 ring-offset-2 ring-offset-card ring-primary'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewHabitColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddHabit} className="w-full bg-gradient-primary">
                Add Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Habit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Habit name..."
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditHabit()}
              className="bg-background border-border"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <div className="flex gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      editColor === color && 'ring-2 ring-offset-2 ring-offset-card ring-primary'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleEditHabit} className="w-full bg-gradient-primary">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-w-[900px]">
        {/* Days header */}
        <div className="grid grid-cols-[200px_repeat(31,1fr)] gap-1 mb-2">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Habits / Days
          </div>
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
          {/* Fill remaining columns if less than 31 days */}
          {Array.from({ length: 31 - daysInMonth.length }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        </div>

        {/* Habit rows */}
        {habits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No habits yet. Add your first habit to get started!</p>
          </div>
        ) : (
          habits.map((habit, index) => (
            <div
              key={habit.id}
              className="grid grid-cols-[200px_repeat(31,1fr)] gap-1 mb-2 items-center animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2 pr-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-sm font-medium text-foreground truncate flex-1">
                  {habit.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => startEditing(habit)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteHabit(habit.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {daysInMonth.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = habit.completedDays.includes(dateStr);
                return (
                  <button
                    key={dateStr}
                    onClick={() => onToggleDay(habit.id, dateStr)}
                    className={cn(
                      'habit-cell group',
                      isCompleted && 'habit-cell-completed',
                      isToday(day) && !isCompleted && 'border-primary/50 animate-pulse-glow'
                    )}
                    style={isCompleted ? { background: habit.color } : undefined}
                  >
                    {isCompleted && (
                      <Check className="w-4 h-4 text-primary-foreground animate-check-bounce" />
                    )}
                  </button>
                );
              })}
              {Array.from({ length: 31 - daysInMonth.length }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
