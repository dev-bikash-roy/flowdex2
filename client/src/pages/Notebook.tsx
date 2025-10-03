import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  NotebookPen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  FolderPlus,
  Folder
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder_id?: string;
  created_at: string;
  updated_at: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export default function Notebook() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    folder_id: "none",
  });

  const [folderForm, setFolderForm] = useState({
    name: "",
    color: "#3b82f6",
  });

  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch folders
  const { data: folders = [], error: foldersError, isLoading: foldersLoading } = useQuery({
    queryKey: ["supabase", "notebook-folders"],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notebook_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Folders query error:', error);
        if (error.message.includes('relation "notebook_folders" does not exist')) {
          return [];
        }
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!user,
    retry: false
  });

  // Fetch notes
  const { data: notes = [], isLoading: notesLoading, error: notesError } = useQuery({
    queryKey: ["supabase", "notebook-notes", selectedFolder, selectedTag],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('notebook_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (selectedFolder !== "all") {
        query = query.eq('folder_id', selectedFolder);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Notes query error:', error);
        if (error.message.includes('relation "notebook_notes" does not exist')) {
          return [];
        }
        throw new Error(error.message);
      }
      
      // Filter by tag if selected
      if (selectedTag !== "all") {
        return data.filter((note: Note) => note.tags?.includes(selectedTag));
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note: Note) => note.tags || [])));

  const resetNoteForm = () => {
    setNoteForm({
      title: "",
      content: "",
      tags: [],
      folder_id: "none",
    });
  };

  const resetFolderForm = () => {
    setFolderForm({
      name: "",
      color: "#3b82f6",
    });
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a folder name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('notebook_folders')
        .insert({
          user_id: user?.id,
          name: folderForm.name.trim(),
          color: folderForm.color,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Folder Created",
        description: "Your folder has been created successfully.",
      });

      // Force refresh the folders query
      await queryClient.invalidateQueries({ queryKey: ["supabase", "notebook-folders"] });
      await queryClient.refetchQueries({ queryKey: ["supabase", "notebook-folders"] });
      
      setCreateFolderModalOpen(false);
      resetFolderForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create folder.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from('notebook_notes')
          .update({
            title: noteForm.title.trim(),
            content: noteForm.content.trim(),
            tags: noteForm.tags,
            folder_id: noteForm.folder_id === "none" ? null : noteForm.folder_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingNote.id);

        if (error) throw new Error(error.message);

        toast({
          title: "Note Updated",
          description: "Your note has been updated successfully.",
        });
      } else {
        // Create new note
        const { error } = await supabase
          .from('notebook_notes')
          .insert({
            user_id: user?.id,
            title: noteForm.title.trim(),
            content: noteForm.content.trim(),
            tags: noteForm.tags,
            folder_id: noteForm.folder_id === "none" ? null : noteForm.folder_id,
          });

        if (error) throw new Error(error.message);

        toast({
          title: "Note Created",
          description: "Your note has been saved successfully.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["supabase", "notebook-notes"] });
      setCreateNoteModalOpen(false);
      setEditingNote(null);
      resetNoteForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save note.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notebook_notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Note Deleted",
        description: "The note has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["supabase", "notebook-notes"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      folder_id: note.folder_id || "none",
    });
    setCreateNoteModalOpen(true);
  };

  const filteredNotes = notes.filter((note: Note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading || notesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if database tables need to be set up
  if (foldersError?.message.includes('relation "notebook_folders" does not exist') || 
      notesError?.message.includes('relation "notebook_notes" does not exist')) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <NotebookPen className="w-8 h-8 text-primary" />
              Notebook
            </h1>
            <p className="text-muted-foreground mt-2">Organize your trading notes and ideas</p>
          </div>
        </div>
        
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <NotebookPen className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Database Setup Required</h3>
            <p className="mb-6 max-w-md mx-auto">
              The Notebook feature requires database tables to be set up. Please run the SQL migration in your Supabase dashboard.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left max-w-2xl mx-auto">
              <p className="text-sm font-medium mb-2">Steps to set up:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to SQL Editor</li>
                <li>Copy the SQL from the <code>RUN_THIS_SQL.sql</code> file</li>
                <li>Paste and run the SQL</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <NotebookPen className="w-8 h-8 text-primary" />
            Notebook
          </h1>
          <p className="text-muted-foreground mt-2">Organize your trading notes and ideas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setCreateFolderModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </Button>
          

          <Button 
            onClick={() => {
              setEditingNote(null);
              resetNoteForm();
              setCreateNoteModalOpen(true);
            }}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </Button>
        </div>
      </div>



      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {folders.map((folder: Folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: folder.color }}
                  />
                  {folder.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag: string) => (
              <SelectItem key={tag} value={tag}>
                #{tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Folders ({folders.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {folders.map((folder: Folder) => (
              <Card 
                key={folder.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: folder.color + '20', border: `2px solid ${folder.color}` }}
                  >
                    <Folder className="w-6 h-6" style={{ color: folder.color }} />
                  </div>
                  <span className="text-sm font-medium truncate w-full">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {notes.filter(note => note.folder_id === folder.id).length} notes
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <NotebookPen className="w-5 h-5 text-primary" />
          Notes ({filteredNotes.length})
        </h2>
        
        {filteredNotes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <NotebookPen className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Notes Yet</h3>
              <p className="mb-6">Start organizing your trading thoughts and strategies</p>
              <Button 
                onClick={() => {
                  setEditingNote(null);
                  resetNoteForm();
                  setCreateNoteModalOpen(true);
                }}
              >
                Create Your First Note
              </Button>
            </div>
          </Card>
        ) : (
        <div className="space-y-3">
          {filteredNotes.map((note: Note) => {
            const folder = folders.find((f: Folder) => f.id === note.folder_id);
            
            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: folder?.color || '#3b82f6' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                          {note.title}
                        </h3>
                        {folder && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: folder.color }}
                            />
                            <span className="text-xs text-muted-foreground">{folder.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {note.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.slice(0, 3).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {note.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(note.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNote(note);
                              }}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}
      </div>

      {/* Create/Edit Note Modal */}
      <Dialog open={createNoteModalOpen} onOpenChange={setCreateNoteModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitNote} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter note title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="folder">Folder (Optional)</Label>
              <Select 
                value={noteForm.folder_id} 
                onValueChange={(value) => setNoteForm({ ...noteForm, folder_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder: Folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your note content..."
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                className="h-40 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                placeholder="e.g., strategy, analysis, idea (comma-separated)"
                value={noteForm.tags.join(', ')}
                onChange={(e) => setNoteForm({ 
                  ...noteForm, 
                  tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
              />
            </div>
            
            <div className="flex items-center space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setCreateNoteModalOpen(false);
                  setEditingNote(null);
                  resetNoteForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingNote ? "Update Note" : "Create Note"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Folder Modal */}
      <Dialog open={createFolderModalOpen} onOpenChange={setCreateFolderModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div>
              <Label htmlFor="folderName">Folder Name *</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={folderForm.name}
                onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="folderColor">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="folderColor"
                  value={folderForm.color}
                  onChange={(e) => setFolderForm({ ...folderForm, color: e.target.value })}
                  className="w-12 h-10 rounded border border-border"
                />
                <Input
                  value={folderForm.color}
                  onChange={(e) => setFolderForm({ ...folderForm, color: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setCreateFolderModalOpen(false);
                  resetFolderForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Folder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}