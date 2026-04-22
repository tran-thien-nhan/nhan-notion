'use client';

import { useState, useEffect } from 'react';
import { Note, Tag } from '@/app/types';
import { X, Save, FileText, Tag as TagIcon, Type, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';

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
  const [showTagModal, setShowTagModal] = useState(false);

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
      isPinned: note?.isPinned || 0,
    };
    onSave(newNote);
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tagName));
  };

  return (
    <>
      {/* Main Modal - Full Screen */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {note ? '✏️ Chỉnh sửa ghi chú' : '✨ Tạo ghi chú mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Full screen scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Type size={16} />
                Tiêu đề *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 text-xl font-medium transition-all"
                placeholder="Nhập tiêu đề..."
                autoFocus
              />
            </div>



            {/* Content - Full width textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Nội dung
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[calc(100vh-450px)] min-h-[400px] bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all resize-none p-4"
                placeholder="Nhập nội dung ghi chú..."
                style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="text-purple-400">💡</span> Gợi ý: Bạn có thể dùng Markdown để định dạng văn bản
              </p>
            </div>
          </div>
          {/* Tags Section */}
          <div className='mb-2'>
            <label className="block text-sm font-medium text-gray-300 m-2 flex items-center gap-2">
              <TagIcon size={16} />
              Tags
            </label>

            {/* Selected tags display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tag => {
                  const tagObj = availableTags.find(t => t.name === tag);
                  return (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                      style={{
                        backgroundColor: tagObj?.color ? `${tagObj.color}30` : '#8B5CF630',
                        color: tagObj?.color || '#8B5CF6'
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tagObj?.color || '#8B5CF6' }}
                      />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:scale-110 transition-transform"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Button to open tag modal */}
            <button
              onClick={() => setShowTagModal(true)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-between text-gray-300"
            >
              <span className="flex items-center gap-2">
                <TagIcon size={18} />
                {selectedTags.length > 0 ? `Đã chọn ${selectedTags.length} tags` : 'Chọn tags'}
              </span>
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black/30 backdrop-blur-md border-t border-white/10 px-6 py-4 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all duration-200 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
          >
            <Save size={18} />
            Lưu ghi chú
          </button>
        </div>
      </div>

      {/* Tag Selection Modal (Small Modal) */}

      {showTagModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700">
            <div className="sticky top-0 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TagIcon size={18} className="text-purple-400" />
                Chọn tags
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : availableTags.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Chưa có tag nào. Hãy tạo tag trong phần quản lý tags!
                </div>
              ) : (
                <div className="space-y-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.name)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isSelected
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50'
                          : 'bg-gray-700/30 border border-gray-700 hover:bg-gray-700/50'
                          }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-white flex-1 text-left">{tag.name}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4">
              <button
                onClick={() => setShowTagModal(false)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium"
              >
                Xong ({selectedTags.length} tags)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}