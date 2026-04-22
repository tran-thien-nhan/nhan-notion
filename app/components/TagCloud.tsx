'use client';

import { Tag } from '@/app/types';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface TagCloudProps {
    notes: any[];
    allTags: Tag[];
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    onReset: () => void;
}

export default function TagCloud({ notes, allTags, selectedTags, onToggleTag, onReset }: TagCloudProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const counts = new Map<string, number>();
        notes.forEach(note => {
            note.tags.split(',').forEach((tag: string) => {
                const trimmedTag = tag.trim();
                if (trimmedTag) {
                    counts.set(trimmedTag, (counts.get(trimmedTag) || 0) + 1);
                }
            });
        });
        setTagCounts(counts);
    }, [notes]);

    const allTagNames = Array.from(tagCounts.keys());
    const displayTags = isExpanded ? allTagNames : allTagNames.slice(0, 12);

    if (allTagNames.length === 0) return null;

    return (
        <div className="mb-6 p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">🏷️ Tất cả tags</span>
                    <span className="text-xs text-gray-500">({allTagNames.length})</span>
                    {selectedTags.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                            Đã chọn {selectedTags.length}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {selectedTags.length > 0 && (
                        <button
                            onClick={onReset}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                        >
                            <RotateCcw size={12} />
                            Reset
                        </button>
                    )}
                    {allTagNames.length > 12 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            {isExpanded ? (
                                <>
                                    Thu gọn <ChevronUp size={12} />
                                </>
                            ) : (
                                <>
                                    Xem thêm <ChevronDown size={12} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {displayTags.map(tagName => {
                    const tagObj = allTags.find(t => t.name === tagName);
                    const count = tagCounts.get(tagName) || 0;
                    const isSelected = selectedTags.includes(tagName);

                    return (
                        <button
                            key={tagName}
                            onClick={() => onToggleTag(tagName)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 hover:scale-105 flex items-center gap-1.5 ${isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
                                }`}
                            style={{
                                backgroundColor: tagObj?.color ? `${tagObj.color}20` : '#8B5CF620',
                                color: tagObj?.color || '#8B5CF6',
                                opacity: isSelected ? 1 : 0.8
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tagObj?.color || '#8B5CF6' }}
                            />
                            {tagName}
                            <span className="text-xs opacity-70">({count})</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}