'use client';

import { Note } from '@/app/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { X, Calendar, Tag, Pin } from 'lucide-react';

interface NoteViewerProps {
    note: Note | null;
    onClose: () => void;
}

export default function NoteViewer({ note, onClose }: NoteViewerProps) {
    if (!note) return null;

    const tags = note.tags.split(',').filter(tag => tag.trim());
    const isPinned = note.isPinned === 1;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    {isPinned && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                            <Pin size={12} className="fill-yellow-400" />
                            <span>Đã ghim</span>
                        </div>
                    )}
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Xem ghi chú
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            {note.title || 'Không có tiêu đề'}
                        </h1>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Tạo: {format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Cập nhật: {format(new Date(note.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                                    >
                                        <Tag size={14} />
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-6"></div>

                    {/* Content */}
                    <div className="prose prose-invert prose-lg max-w-none">
                        {note.content ? (
                            <div
                                className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words"
                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '1.1rem' }}
                                dangerouslySetInnerHTML={{
                                    __html: note.content
                                        .replace(/&/g, '&amp;')
                                        .replace(/</g, '&lt;')
                                        .replace(/>/g, '&gt;')
                                        .replace(/\n/g, '<br/>')
                                        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-purple-300">$1</code>')
                                        .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold text-white mt-6 mb-3">$1</h3>')
                                        .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
                                        .replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold text-white mt-10 mb-5">$1</h1>')
                                        .replace(/^- (.*?)$/gm, '<li class="ml-4 mb-1">$1</li>')
                                        .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>')
                                }}
                            />
                        ) : (
                            <p className="text-gray-500 italic">Không có nội dung</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}