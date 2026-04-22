'use client';

import { useState, useEffect } from 'react';
import { Note, Tag } from '@/app/types';
import { X, Save, FileText, Tag as TagIcon, Type } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  onClose: () => void;
}

export default function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags.split(',').filter(tag => tag.trim()));
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
    }
  }, [note]);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setAvailableTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSave = () => {
    const newNote: Note = {
      id: note?.id || Date.now().toString(),
      title,
      content,
      tags: selectedTags.join(','),
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newNote);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {note ? '✏️ Chỉnh sửa ghi chú' : '✨ Tạo ghi chú mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Type size={16} />
              Tiêu đề *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
              placeholder="Nhập tiêu đề..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <TagIcon size={16} />
              Tags
            </label>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 flex items-center gap-2 ${selectedTags.includes(tag.name)
                      ? 'text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.name) ? tag.color : undefined,
                      background: !selectedTags.includes(tag.name) ? 'rgba(55, 65, 81, 0.5)' : undefined
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Nội dung
            </label>
            <div data-color-mode="dark">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={400}
                preview="live"
                className="rounded-lg overflow-hidden"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all duration-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Save size={18} />
            Lưu ghi chú
          </button>
        </div>
      </div>
    </div>
  );
}