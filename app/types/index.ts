export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string;
    createdAt: string;
    updatedAt: string;
    isPinned?: number; // 0 = không ghim, 1 = đã ghim
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export const SHEET_HEADERS: string[] = [
    "ID",
    "Tiêu đề",
    "Nội dung",
    "Tags",
    "Ngày tạo",
    "Ngày cập nhật",
    "Đã ghim" // 0 hoặc 1
];

export const TAG_SHEET_HEADERS: string[] = [
    "ID",
    "Tên tag",
    "Màu sắc",
    "Ngày tạo",
    "Ngày cập nhật"
];

export const TAG_COLORS = [
    { name: 'Đỏ', value: '#EF4444' },
    { name: 'Cam', value: '#F97316' },
    { name: 'Vàng', value: '#EAB308' },
    { name: 'Xanh lá', value: '#10B981' },
    { name: 'Xanh dương', value: '#3B82F6' },
    { name: 'Tím', value: '#8B5CF6' },
    { name: 'Hồng', value: '#EC4899' },
    { name: 'Xám', value: '#6B7280' },
];