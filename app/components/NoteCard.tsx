'use client';

import { Note } from '@/app/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Tag, Trash2, Edit2, FileText, Pin, PinOff, Star, Eye } from 'lucide-react';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
    onTagClick?: (tag: string) => void;
    onTogglePin?: (id: string) => void;
    onView?: (note: Note) => void; // Thêm prop cho xem fullscreen
}

export default function NoteCard({ note, onEdit, onDelete, onTagClick, onTogglePin, onView }: NoteCardProps) {
    const tags = note.tags.split(',').filter(tag => tag.trim());
    const isPinned = note.isPinned === 1;

    return (
        <div 
            className={`group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer ${
                isPinned 
                    ? 'border-yellow-500/70 bg-gradient-to-br from-yellow-500/10 to-orange-500/5' 
                    : 'border-gray-700/50 hover:border-gray-600'
            } hover:scale-[1.02]`} 
            onClick={() => onEdit(note)}
        >
            {/* Pin ribbon effect */}
            {isPinned && (
                <div className="absolute top-0 right-0 overflow-hidden w-16 h-16">
                    <div className="absolute transform rotate-45 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold py-0.5 right-[-35px] top-[12px] w-24 text-center shadow-lg">
                        <div className="flex items-center justify-center gap-1">
                            <Pin size={10} className="fill-white" />
                            <span>GHIM</span>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-6 relative">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-1">
                        {isPinned ? (
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        ) : (
                            <FileText className="text-blue-400 w-5 h-5" />
                        )}
                        <h3 className={`text-xl font-semibold line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all ${
                            isPinned ? 'text-yellow-200' : 'text-white'
                        }`}>
                            {note.title || 'Không có tiêu đề'}
                        </h3>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onView && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView(note);
                                }}
                                className="text-gray-400 hover:text-green-400 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
                                title="Xem toàn màn hình"
                            >
                                <Eye size={18} />
                            </button>
                        )}
                        {onTogglePin && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePin(note.id);
                                }}
                                className={`transition-all p-1 rounded-lg hover:scale-110 ${
                                    isPinned 
                                        ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/20' 
                                        : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                                }`}
                                title={isPinned ? 'Bỏ ghim' : 'Ghim'}
                            >
                                {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(note);
                            }}
                            className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(note.id);
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-300">
                    {note.content ? (
                        <div dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '') }} />
                    ) : (
                        'Không có nội dung'
                    )}
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTagClick?.(tag.trim());
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 hover:scale-105 transition-transform"
                            >
                                <Tag size={12} />
                                {tag.trim()}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 text-xs pt-2 border-t border-gray-700/50">
                    <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={14} />
                        <span>{format(new Date(note.createdAt), 'dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={14} />
                        <span>cập nhật: {format(new Date(note.updatedAt), 'HH:mm', { locale: vi })}</span>
                    </div>
                    {isPinned && (
                        <div className="flex items-center gap-1 text-yellow-400 ml-auto">
                            <Pin size={10} className="fill-yellow-400" />
                            <span className="text-[10px]">Đã ghim</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}