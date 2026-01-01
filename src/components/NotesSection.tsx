import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Note } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (content: string, date: string) => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesSection({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim(), format(new Date(), 'yyyy-MM-dd'));
      setNewNote('');
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      onUpdateNote(editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">Notes</h3>

      {/* Add note */}
      <div className="space-y-2 mb-4">
        <Textarea
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="bg-background border-border resize-none min-h-[80px]"
        />
        <Button onClick={handleAddNote} className="w-full bg-gradient-primary gap-2">
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Notes list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg bg-background/50 group animate-fade-in"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-background border-border resize-none min-h-[60px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} className="gap-1">
                      <Save className="w-3 h-3" />
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1">
                      <X className="w-3 h-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), 'MMM d, yyyy')}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => startEditing(note)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onDeleteNote(note.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
