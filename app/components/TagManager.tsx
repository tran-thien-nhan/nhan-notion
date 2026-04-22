'use client';

import { useState, useEffect } from 'react';
import { Tag, TAG_COLORS } from '@/app/types';
import { X, Plus, Save, Edit2, Trash2, Palette } from 'lucide-react';

interface TagManagerProps {
    onClose: () => void;
    onTagsChange: () => void;
}

export default function TagManager({ onClose, onTagsChange }: TagManagerProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState(TAG_COLORS[4].value);
    const [loading, setLoading] = useState(true);

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
    };

    const resetForm = () => {
        setEditingTag(null);
        setTagName('');
        setTagColor(TAG_COLORS[4].value);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
                <div className="sticky top-0 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        🏷️ Quản lý Tags
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Form thêm/sửa tag */}
                    <div className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {editingTag ? '✏️ Chỉnh sửa tag' : '➕ Thêm tag mới'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tên tag
                                </label>
                                <input
                                    type="text"
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                                    placeholder="Nhập tên tag..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Palette size={16} />
                                    Màu sắc
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TAG_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setTagColor(color.value)}
                                            className={`w-10 h-10 rounded-full transition-all duration-200 ${tagColor === color.value
                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110'
                                                : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSaveTag}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingTag ? 'Cập nhật' : 'Thêm tag'}
                                </button>
                                {editingTag && (
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all duration-200"
                                    >
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Danh sách tags */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            📋 Danh sách tags ({tags.length})
                        </h3>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                            </div>
                        ) : tags.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                Chưa có tag nào. Hãy thêm tag đầu tiên!
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            <span className="text-white font-medium">{tag.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditTag(tag)}
                                                className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTag(tag.id)}
                                                className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}