import { NextRequest, NextResponse } from "next/server";
import { getAllTags, addTag, updateTag, deleteTag } from "../../lib/googleSheets";
import { Tag } from "../../types";

export async function GET() {
    try {
        const tags = await getAllTags();
        return NextResponse.json(tags);
    } catch (error: any) {
        console.error("GET tags error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch tags" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: "Missing required field: name" },
                { status: 400 }
            );
        }

        const tag: Tag = {
            ...body,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const newTag = await addTag(tag);
        return NextResponse.json(newTag, { status: 201 });
    } catch (error: any) {
        console.error("POST tag error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to add tag" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "Missing tag id" },
                { status: 400 }
            );
        }

        const updatedTag = await updateTag(body);
        return NextResponse.json(updatedTag);
    } catch (error: any) {
        console.error("PUT tag error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update tag" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Missing id parameter" },
                { status: 400 }
            );
        }

        await deleteTag(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE tag error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete tag" },
            { status: 500 }
        );
    }
}