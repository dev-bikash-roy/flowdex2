-- COPY AND PASTE THIS INTO YOUR SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard -> Your Project -> SQL Editor -> New Query

-- Notebook folders table
CREATE TABLE IF NOT EXISTS notebook_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notebook notes table
CREATE TABLE IF NOT EXISTS notebook_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES notebook_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notebook_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notebook folders
CREATE POLICY "Users can view their own notebook folders" ON notebook_folders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert notebook folders" ON notebook_folders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notebook folders" ON notebook_folders
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notebook folders" ON notebook_folders
  FOR DELETE USING (user_id = auth.uid());

-- Create policies for notebook notes
CREATE POLICY "Users can view their own notebook notes" ON notebook_notes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert notebook notes" ON notebook_notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notebook notes" ON notebook_notes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notebook notes" ON notebook_notes
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notebook_folders_user_id ON notebook_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_notes_user_id ON notebook_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_notes_folder_id ON notebook_notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notebook_notes_created_at ON notebook_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notebook_notes_is_pinned ON notebook_notes(is_pinned);