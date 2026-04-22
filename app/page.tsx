'use client';

import { useState, useEffect, useCallback } from 'react';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import TagFilter from './components/TagFilter';
import TagCloud from './components/TagCloud';
import { Note, Tag } from './types';
import { Plus, LayoutGrid, LayoutList, Sparkles, Settings, X, RotateCcw } from 'lucide-react';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setAllTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [fetchNotes, fetchTags]);

  // Filter notes by multiple tags (AND logic)
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(notes.filter(note => {
        const noteTags = note.tags.split(',').map(t => t.trim());
        return selectedTags.every(tag => noteTags.includes(tag));
      }));
    }
  }, [selectedTags, notes]);

  // Trong handleSaveNote, đảm bảo id là unique
  const handleSaveNote = async (note: Note) => {
    try {
      const url = '/api/notes';
      const existingNote = notes.find(n => n.id === note.id);
      const method = existingNote ? 'PUT' : 'POST';

      // Đảm bảo id luôn unique khi tạo mới
      const noteToSave = {
        ...note,
        id: existingNote ? note.id : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteToSave),
      });

      if (response.ok) {
        await fetchNotes();
        setIsEditorOpen(false);
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      try {
        const response = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchNotes();
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, { method: 'PATCH' });
      if (response.ok) {
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleTagsChange = () => {
    fetchNotes();
    fetchTags();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-purple-400 w-6 h-6 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-300 text-lg font-medium">Đang tải ghi chú...</p>
          <p className="text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  const getPopularTags = () => {
    const tagCount = new Map();
    notes.forEach(note => {
      note.tags.split(',').forEach(tag => {
        const trimmedTag = tag.trim();
        if (trimmedTag) {
          tagCount.set(trimmedTag, (tagCount.get(trimmedTag) || 0) + 1);
        }
      });
    });
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tagName]) => tagName);
  };

  const popularTags = getPopularTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-50"></div>
                  <Sparkles className="relative w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Notion Clone
                </h1>
                <div className="hidden md:flex items-center gap-2 ml-2">
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-sm text-gray-400">
                    {filteredNotes.length} / {notes.length} ghi chú
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedTags.length > 0 && (
                <button
                  onClick={clearAllTags}
                  className="relative group p-2 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/50 hover:bg-red-500/30 transition-all duration-200"
                  title="Xóa tất cả bộ lọc"
                >
                  <RotateCcw size={18} className="text-red-400 group-hover:text-red-300 transition-colors" />
                </button>
              )}

              <button
                onClick={() => setShowTagFilter(true)}
                className="relative group p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200"
              >
                <Settings size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                {selectedTags.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse">
                    <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping"></span>
                  </span>
                )}
              </button>

              <div className="flex gap-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <LayoutList size={18} />
                </button>
              </div>

              <button
                onClick={async () => {
                  await fetch('/api/notes/reset', { method: 'POST' });
                  await fetchNotes();
                }}
                className="p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200"
                title="Reset cache"
              >
                <RotateCcw size={18} className="text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setEditingNote(null);
                  setIsEditorOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium text-sm"
              >
                <Plus size={16} />
                Tạo ghi chú
              </button>
            </div>
          </div>

          {/* Popular Tags Quick Filter */}
          {popularTags.length > 0 && (
            <div className="pb-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="text-xs text-gray-500 mr-1">🔥 Phổ biến:</span>
              {popularTags.map(tag => {
                const tagObj = allTags.find(t => t.name === tag);
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 flex items-center gap-1 ${isSelected ? 'ring-2 ring-purple-500' : ''
                      }`}
                    style={{
                      backgroundColor: tagObj?.color ? `${tagObj.color}20` : '#8B5CF620',
                      color: tagObj?.color || '#8B5CF6'
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tagObj?.color || '#8B5CF6' }}
                    />
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Filters Display */}
          {selectedTags.length > 0 && (
            <div className="pb-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => {
                  const tagObj = allTags.find(t => t.name === tag);
                  return (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: tagObj?.color ? `${tagObj.color}20` : '#8B5CF620',
                        color: tagObj?.color || '#8B5CF6'
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tagObj?.color || '#8B5CF6' }}
                      />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:scale-110 transition-transform"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={clearAllTags}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                >
                  <RotateCcw size={10} />
                  Reset
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Lọc theo {selectedTags.length} tag • {filteredNotes.length} ghi chú
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TagCloud
          notes={notes}
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onReset={clearAllTags}
        />

        <NoteList
          notes={filteredNotes}
          viewMode={viewMode}
          onNewNote={() => {
            setEditingNote(null);
            setIsEditorOpen(true);
          }}
          onEditNote={(note) => {
            setEditingNote(note);
            setIsEditorOpen(true);
          }}
          onDeleteNote={handleDeleteNote}
          onTagClick={toggleTag}
          onTogglePin={handleTogglePin}
        />
      </div>

      {isEditorOpen && (
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNote(null);
          }}
        />
      )}

      {showTagFilter && (
        <TagFilter
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onTagsChange={handleTagsChange}
          onClose={() => setShowTagFilter(false)}
          onReset={clearAllTags}
        />
      )}
    </div>
  );
}