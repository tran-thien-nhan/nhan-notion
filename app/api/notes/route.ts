import { NextRequest, NextResponse } from "next/server";
import { getAllNotes, addNote, updateNote, deleteNote, deleteMultipleNotes, togglePinNote } from "../../lib/googleSheets";
import { Note } from "../../types";

export async function GET() {
    try {
        const notes = await getAllNotes();
        return NextResponse.json(notes, {
            headers: {
                'Cache-Control': 'no-store', // 👈 THÊM DÒNG NÀY
            },
        });
    } catch (error: any) {
        console.error("GET error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch notes" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title) {
            return NextResponse.json(
                { error: "Missing required field: title" },
                { status: 400 }
            );
        }

        const note: Note = {
            id: Date.now().toString(),
            title: body.title,
            content: body.content || "",
            tags: body.tags || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: 0, // Mặc định là 0 (không ghim)
        };

        const newNote = await addNote(note);
        return NextResponse.json(newNote, { status: 201 });
    } catch (error: any) {
        console.error("POST error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to add note" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "Missing note id" },
                { status: 400 }
            );
        }

        // Only update the fields that are provided
        const updateData: Partial<Note> = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.content !== undefined) updateData.content = body.content;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.isPinned !== undefined) updateData.isPinned = body.isPinned;

        updateData.id = body.id;

        const updatedNote = await updateNote(updateData as Note);
        return NextResponse.json(updatedNote);
    } catch (error: any) {
        console.error("PUT error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update note" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        console.log('PATCH request received for note:', id);

        if (!id) {
            return NextResponse.json(
                { error: "Missing note id" },
                { status: 400 }
            );
        }

        const updatedNote = await togglePinNote(id);
        console.log('Toggle pin result:', updatedNote);

        return NextResponse.json(updatedNote);
    } catch (error: any) {
        console.error("PATCH error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to toggle pin" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const idsParam = searchParams.get("ids");

        if (idsParam) {
            const ids = JSON.parse(idsParam);
            if (!Array.isArray(ids) || ids.length === 0) {
                return NextResponse.json(
                    { error: "Invalid ids array" },
                    { status: 400 }
                );
            }
            await deleteMultipleNotes(ids);
            return NextResponse.json({ success: true, deletedCount: ids.length });
        }
        else if (id) {
            await deleteNote(id);
            return NextResponse.json({ success: true });
        }
        else {
            return NextResponse.json(
                { error: "Missing id or ids parameter" },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("DELETE error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete note" },
            { status: 500 }
        );
    }
}