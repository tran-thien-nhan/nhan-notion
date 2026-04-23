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
    // Màu đơn sắc
    { name: 'Đỏ', value: '#EF4444' },
    { name: 'Cam', value: '#F97316' },
    { name: 'Vàng', value: '#EAB308' },
    { name: 'Xanh lá', value: '#10B981' },
    { name: 'Xanh dương', value: '#3B82F6' },
    { name: 'Tím', value: '#8B5CF6' },
    { name: 'Hồng', value: '#EC4899' },
    { name: 'Xám', value: '#6B7280' },

    // Màu bổ sung
    { name: 'Đỏ đậm', value: '#DC2626' },
    { name: 'Cam đậm', value: '#EA580C' },
    { name: 'Vàng chanh', value: '#FACC15' },
    { name: 'Xanh ngọc', value: '#14B8A6' },
    { name: 'Xanh coban', value: '#2563EB' },
    { name: 'Tím lavender', value: '#A855F7' },
    { name: 'Hồng phấn', value: '#F472B6' },
    { name: 'Nâu', value: '#78350F' },
    { name: 'Teal', value: '#0D9488' },
    { name: 'Xanh navy', value: '#1E3A8A' },
    { name: 'Hồng đậm', value: '#BE185D' },
    { name: 'Vàng mustard', value: '#B45309' },
    { name: 'Xanh mint', value: '#34D399' },
    { name: 'Tím than', value: '#6D28D9' },
];

// Gradient colors
export const TAG_GRADIENTS = [
    { name: 'Đỏ cam', value: 'linear-gradient(135deg, #EF4444, #F97316)' },
    { name: 'Vàng xanh', value: 'linear-gradient(135deg, #EAB308, #10B981)' },
    { name: 'Xanh dương tím', value: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' },
    { name: 'Hồng tím', value: 'linear-gradient(135deg, #EC4899, #A855F7)' },
    { name: 'Đỏ hồng', value: 'linear-gradient(135deg, #DC2626, #F472B6)' },
    { name: 'Cam vàng', value: 'linear-gradient(135deg, #F97316, #FACC15)' },
    { name: 'Xanh lá ngọc', value: 'linear-gradient(135deg, #10B981, #14B8A6)' },
    { name: 'Tím hồng', value: 'linear-gradient(135deg, #8B5CF6, #EC4899)' },
    { name: 'Xanh dương navy', value: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' },
    { name: 'Xám xanh', value: 'linear-gradient(135deg, #6B7280, #3B82F6)' },
    { name: 'Nâu vàng', value: 'linear-gradient(135deg, #78350F, #B45309)' },
    { name: 'Đen xám', value: 'linear-gradient(135deg, #1F2937, #6B7280)' },
    { name: 'Hồng cam', value: 'linear-gradient(135deg, #F472B6, #F97316)' },
    { name: 'Xanh mint tím', value: 'linear-gradient(135deg, #34D399, #8B5CF6)' },
    { name: 'Vàng hồng', value: 'linear-gradient(135deg, #FACC15, #EC4899)' },
];

// Nếu muốn gộp chung để dễ sử dụng
export const ALL_TAG_STYLES = [
    ...TAG_COLORS,
    ...TAG_GRADIENTS,
];