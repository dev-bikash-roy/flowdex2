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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Filter, Edit, Trash2, FileText, Calendar } from "lucide-react";

export default function Journal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    tradeId: "",
    title: "",
    content: "",
    emotions: [] as string[],
    lessons: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch trades from Supabase
  const { data: trades = [] } = useQuery({
    queryKey: ["supabase", "trades"],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_time', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Fetch journal entries from Supabase
  const { data: journalEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["supabase", "journal-entries", selectedTrade !== "all" ? selectedTrade : undefined],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (selectedTrade !== "all") {
        query = query.eq('trade_id', selectedTrade);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!user,
  });

  const resetForm = () => {
    setFormData({
      tradeId: "",
      title: "",
      content: "",
      emotions: [],
      lessons: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (editingEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('journal_entries')
          .update({
            title: formData.title,
            content: formData.content,
            emotions: formData.emotions,
            lessons: formData.lessons,
          })
          .eq('id', editingEntry.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Journal Entry Updated",
          description: "Your journal entry has been updated successfully.",
        });
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            trade_id: formData.tradeId || null,
            user_id: user.id,
            title: formData.title,
            content: formData.content,
            emotions: formData.emotions,
            lessons: formData.lessons,
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Journal Entry Created",
          description: "Your journal entry has been saved successfully.",
        });
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["supabase", "journal-entries"] });
      
      // Close modal and reset form
      setEditingEntry(null);
      setCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Journal Entry Deleted",
        description: "The journal entry has been deleted successfully.",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["supabase", "journal-entries"] });
    } catch (error: any) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      tradeId: entry.trade_id || "",
      title: entry.title,
      content: entry.content,
      emotions: entry.emotions || [],
      lessons: entry.lessons || [],
    });
  };

  const filteredEntries = journalEntries.filter((entry: any) =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || entriesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" data-testid="page-journal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Journal</h1>
          <p className="text-muted-foreground mt-2">Document your trading insights and lessons learned</p>
        </div>
        <Button 
          onClick={() => {
            setEditingEntry(null);
            resetForm();
            setCreateModalOpen(true);
          }}
          className="flex items-center space-x-2"
          data-testid="button-new-entry"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search journal entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
        <Select value={selectedTrade} onValueChange={setSelectedTrade}>
          <SelectTrigger className="w-[200px]" data-testid="select-trade-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            {trades.map((trade: any) => (
              <SelectItem key={trade.id} value={trade.id}>
                {trade.pair} - {new Date(trade.entry_time).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Journal Entries */}
      {filteredEntries.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Journal Entries Yet</h3>
            <p className="mb-6">Start documenting your trading insights and lessons learned</p>
            <Button 
              onClick={() => {
                setEditingEntry(null);
                resetForm();
                setCreateModalOpen(true);
              }}
              data-testid="button-create-first-entry"
            >
              Create Your First Entry
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEntries.map((entry: any, index: number) => {
            const associatedTrade = trades.find((trade: any) => trade.id === entry.trade_id);
            
            return (
              <Card key={entry.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2" data-testid={`text-entry-title-${index}`}>
                        {entry.title}
                      </CardTitle>
                      {associatedTrade && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" data-testid={`badge-trade-pair-${index}`}>
                            {associatedTrade.pair}
                          </Badge>
                          <span data-testid={`text-trade-date-${index}`}>
                            {new Date(associatedTrade.entry_time).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(entry)}
                        data-testid={`button-edit-entry-${index}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                        data-testid={`button-delete-entry-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-entry-content-${index}`}>
                    {entry.content}
                  </p>
                  
                  {entry.emotions && entry.emotions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Emotions</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.emotions.slice(0, 3).map((emotion: string, emotionIndex: number) => (
                          <Badge key={emotionIndex} variant="secondary" className="text-xs" data-testid={`badge-emotion-${index}-${emotionIndex}`}>
                            {emotion}
                          </Badge>
                        ))}
                        {entry.emotions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.emotions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {entry.lessons && entry.lessons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Lessons</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.lessons.slice(0, 2).map((lesson: string, lessonIndex: number) => (
                          <Badge key={lessonIndex} variant="outline" className="text-xs" data-testid={`badge-lesson-${index}-${lessonIndex}`}>
                            {lesson}
                          </Badge>
                        ))}
                        {entry.lessons.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{entry.lessons.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span data-testid={`text-entry-date-${index}`}>
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Entry Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="modal-journal-entry">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Journal Entry' : 'Create New Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tradeId">Associated Trade (Optional)</Label>
              <Select 
                value={formData.tradeId} 
                onValueChange={(value) => setFormData({ ...formData, tradeId: value })}
              >
                <SelectTrigger data-testid="select-associated-trade">
                  <SelectValue placeholder="Select a trade..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No associated trade</SelectItem>
                  {trades.map((trade: any) => (
                    <SelectItem key={trade.id} value={trade.id}>
                      {trade.pair} - {new Date(trade.entry_time).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter entry title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-entry-title"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your trading insights, observations, and analysis..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="h-32 resize-none"
                data-testid="textarea-entry-content"
              />
            </div>

            <div>
              <Label htmlFor="emotions">Emotions (Optional)</Label>
              <Input
                id="emotions"
                placeholder="e.g., confident, anxious, patient (comma-separated)"
                value={formData.emotions.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  emotions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                data-testid="input-emotions"
              />
            </div>

            <div>
              <Label htmlFor="lessons">Lessons Learned (Optional)</Label>
              <Input
                id="lessons"
                placeholder="e.g., wait for confirmation, manage risk better (comma-separated)"
                value={formData.lessons.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lessons: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                data-testid="input-lessons"
              />
            </div>
            
            <div className="flex items-center space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditingEntry(null);
                  resetForm();
                }}
                data-testid="button-cancel-entry"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
                data-testid="button-save-entry"
              >
                {isSubmitting ? "Saving..." : editingEntry ? "Update Entry" : "Create Entry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
