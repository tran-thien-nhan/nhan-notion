'use client';

import { Note } from '@/app/types';
import NoteCard from './NoteCard';
import { Plus, FileText, Pin } from 'lucide-react';

interface NoteListProps {
    notes: Note[];
    viewMode: 'grid' | 'list';
    onNewNote: () => void;
    onEditNote: (note: Note) => void;
    onDeleteNote: (id: string) => void;
    onTagClick?: (tag: string) => void;
    onTogglePin?: (id: string) => void;
}

export default function NoteList({ notes, viewMode, onNewNote, onEditNote, onDeleteNote, onTagClick, onTogglePin }: NoteListProps) {
    if (notes.length === 0) {
        return (
            <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/50">
                <FileText className="mx-auto text-gray-600 w-20 h-20 mb-4" />
                <p className="text-gray-300 text-xl font-medium mb-2">Chưa có ghi chú nào</p>
                <p className="text-gray-500 text-sm mb-6">Hãy tạo ghi chú đầu tiên của bạn</p>
                <button
                    onClick={onNewNote}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                    <Plus size={18} />
                    Tạo ghi chú mới
                </button>
            </div>
        );
    }

    // Tách riêng pinned (isPinned === 1) và unpinned notes (isPinned === 0)
    const pinnedNotes = notes.filter(note => note.isPinned === 1);
    const unpinnedNotes = notes.filter(note => note.isPinned !== 1);

    return (
        <div>
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Pin size={16} className="text-yellow-400 fill-yellow-400" />
                        <h2 className="text-lg font-semibold text-gray-300">Đã ghim</h2>
                        <span className="text-xs text-gray-500">({pinnedNotes.length})</span>
                    </div>
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }>
                        {pinnedNotes.map((note) => (
                            <NoteCard
                                key={`pinned-${note.id}`}
                                note={note}
                                onEdit={onEditNote}
                                onDelete={onDeleteNote}
                                onTagClick={onTagClick}
                                onTogglePin={onTogglePin}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Unpinned Notes Section */}
            {unpinnedNotes.length > 0 && (
                <div>
                    {pinnedNotes.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={16} className="text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-300">Ghi chú khác</h2>
                            <span className="text-xs text-gray-500">({unpinnedNotes.length})</span>
                        </div>
                    )}
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }>
                        {unpinnedNotes.map((note) => (
                            <NoteCard
                                key={`unpinned-${note.id}`}
                                note={note}
                                onEdit={onEditNote}
                                onDelete={onDeleteNote}
                                onTagClick={onTagClick}
                                onTogglePin={onTogglePin}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}