'use client';

import { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Plus, Edit2, Trash2, Save, Palette, Sparkles, Check, RotateCcw } from 'lucide-react';
import { Tag, TAG_COLORS } from '@/app/types';

interface TagFilterProps {
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    onTagsChange: () => void;
    onClose: () => void;
    onReset: () => void;
}

export default function TagFilter({ selectedTags, onToggleTag, onTagsChange, onClose, onReset }: TagFilterProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState(TAG_COLORS[4].value);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            setTags(data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTag = async () => {
        if (!tagName.trim()) {
            alert('Vui lòng nhập tên tag');
            return;
        }

        try {
            const url = '/api/tags';
            const method = editingTag ? 'PUT' : 'POST';
            const body = editingTag
                ? { ...editingTag, name: tagName, color: tagColor }
                : { name: tagName, color: tagColor };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                await fetchTags();
                onTagsChange();
                resetForm();
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error saving tag:', error);
        }
    };

    const handleDeleteTag = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa tag này?')) {
            try {
                const response = await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
                if (response.ok) {
                    await fetchTags();
                    onTagsChange();
                }
            } catch (error) {
                console.error('Error deleting tag:', error);
            }
        }
    };

    const handleEditTag = (tag: Tag) => {
        setEditingTag(tag);
        setTagName(tag.name);
        setTagColor(tag.color);
        setShowAddForm(true);
    };

    const resetForm = () => {
        setEditingTag(null);
        setTagName('');
        setTagColor(TAG_COLORS[4].value);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700 animate-fade-in">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-50"></div>
                            <TagIcon className="relative w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Quản lý Tags
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        {selectedTags.length > 0 && (
                            <button
                                onClick={onReset}
                                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10 flex items-center gap-1 text-sm"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    {/* Current filter display */}
                    {selectedTags.length > 0 && (
                        <div className="mb-5 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm text-gray-300">Đang lọc theo:</span>
                                    <span className="text-sm font-medium text-purple-300">{selectedTags.length} tags</span>
                                </div>
                                <button
                                    onClick={onReset}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                >
                                    <RotateCcw size={12} />
                                    Xóa tất cả
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map(tag => {
                                    const tagObj = tags.find(t => t.name === tag);
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
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add tag button */}
                    {!showAddForm && (
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(true);
                            }}
                            className="w-full mb-5 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-dashed border-blue-500/50 rounded-lg hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            <Plus size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-blue-400">Thêm tag mới</span>
                        </button>
                    )}

                    {/* Add/Edit form */}
                    {showAddForm && (
                        <div className="mb-5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                            <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                {editingTag ? (
                                    <>
                                        <Edit2 size={16} className="text-yellow-400" />
                                        Chỉnh sửa tag
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} className="text-green-400" />
                                        Thêm tag mới
                                    </>
                                )}
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                                    placeholder="Nhập tên tag..."
                                    autoFocus
                                />
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                                        <Palette size={12} />
                                        Chọn màu
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {TAG_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setTagColor(color.value)}
                                                className={`w-8 h-8 rounded-full transition-all duration-200 ${tagColor === color.value
                                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110'
                                                        : 'hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSaveTag}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Save size={14} />
                                        {editingTag ? 'Cập nhật' : 'Thêm tag'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setShowAddForm(false);
                                        }}
                                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags list */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">
                            Chọn tags để lọc ({tags.length})
                        </h3>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            </div>
                        ) : tags.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Chưa có tag nào. Hãy thêm tag đầu tiên!
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {tags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag.name);
                                    return (
                                        <div
                                            key={tag.id}
                                            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${isSelected
                                                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50'
                                                    : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 hover:border-gray-600'
                                                }`}
                                            onClick={() => onToggleTag(tag.name)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                <span className="text-white font-medium text-sm">{tag.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isSelected && (
                                                    <Check size={14} className="text-purple-400" />
                                                )}
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleEditTag(tag)}
                                                        className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded hover:bg-gray-700/50"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTag(tag.id)}
                                                        className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-700/50"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}