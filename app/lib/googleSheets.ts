import 'server-only';
import { google } from "googleapis";
import { SHEET_HEADERS, TAG_SHEET_HEADERS, Note, Tag } from "../types";

let notesCache: Note[] | null = null;
let tagsCache: Tag[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export async function getSheets() {
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
        throw new Error("Missing GOOGLE_CLIENT_EMAIL environment variable");
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error("Missing GOOGLE_PRIVATE_KEY environment variable");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
}

export function clearSheetCache() {
    notesCache = null;
    tagsCache = null;
    cacheTimestamp = 0;
}

// Helper function to ensure sheet exists
async function ensureSheetExists(spreadsheetId: string, sheetName: string) {
    const sheets = await getSheets();

    try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetExists = spreadsheet.data.sheets?.some(
            sheet => sheet.properties?.title === sheetName
        );

        if (!sheetExists) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [{
                        addSheet: {
                            properties: { title: sheetName }
                        }
                    }]
                }
            });
            console.log(`Created sheet: ${sheetName}`);
        }
        return true;
    } catch (error) {
        console.error(`Error ensuring sheet ${sheetName} exists:`, error);
        return false;
    }
}

// Note functions
function rowToNote(row: string[]): Note {
    return {
        id: row[0] || "",
        title: row[1] || "",
        content: row[2] || "",
        tags: row[3] || "",
        createdAt: row[4] || new Date().toISOString(),
        updatedAt: row[5] || new Date().toISOString(),
        isPinned: row[6] === '1' ? 1 : 0, // '1' = pinned, '0' = not pinned
    };
}

function noteToRow(note: Note): string[] {
    return [
        note.id,
        note.title,
        note.content,
        note.tags,
        note.createdAt,
        note.updatedAt,
        note.isPinned === 1 ? '1' : '0', // Convert to string for sheet
    ];
}

export async function getAllNotes(): Promise<Note[]> {
    const now = Date.now();

    if (notesCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return [...notesCache];
    }

    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        console.error("SPREADSHEET_ID is not defined");
        return [];
    }

    const sheets = await getSheets();
    await ensureSheetExists(spreadsheetId, "Notes");

    try {
        const headerCheck = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Notes!A1:G1",
        });

        if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "Notes!A1:G1",
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [SHEET_HEADERS] },
            });
            notesCache = [];
            cacheTimestamp = now;
            return [];
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Notes!A2:G",
        });

        const values = response.data.values || [];
        const notes: Note[] = values
            .map((row: string[]) => rowToNote(row))
            .filter((note: Note) => note.id);

        // Sort: pinned notes first (isPinned === 1), then by updated date
        notes.sort((a, b) => {
            if (a.isPinned === 1 && b.isPinned !== 1) return -1;
            if (a.isPinned !== 1 && b.isPinned === 1) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        notesCache = [...notes];
        cacheTimestamp = now;
        return [...notes];
    } catch (error) {
        console.error("Error getting notes:", error);
        return notesCache ? [...notesCache] : [];
    }
}

export async function addNote(note: Note): Promise<Note> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();
    await ensureSheetExists(spreadsheetId, "Notes");

    const newNote: Note = {
        ...note,
        id: note.id || Date.now().toString(),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: note.isPinned || 0,
    };

    const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Notes!A1:G1",
    });

    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Notes!A1:G1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [SHEET_HEADERS] },
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Notes!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [noteToRow(newNote)] },
    });

    clearSheetCache();
    return { ...newNote };
}

export async function updateNote(note: Note): Promise<Note> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Notes!A2:G",
    });

    const values = response.data.values || [];
    let rowIndex = -1;
    let existingRow: string[] = [];

    for (let i = 0; i < values.length; i++) {
        if (values[i][0] === note.id) {
            rowIndex = i;
            existingRow = values[i];
            break;
        }
    }

    if (rowIndex === -1) {
        throw new Error("Note not found");
    }

    const updatedNote: Note = {
        id: note.id,
        title: note.title !== undefined ? note.title : existingRow[1],
        content: note.content !== undefined ? note.content : existingRow[2],
        tags: note.tags !== undefined ? note.tags : existingRow[3],
        createdAt: existingRow[4] || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: note.isPinned !== undefined ? note.isPinned : (existingRow[6] === '1' ? 1 : 0),
    };

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Notes!A${rowIndex + 2}:G${rowIndex + 2}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [noteToRow(updatedNote)] },
    });

    clearSheetCache();
    return { ...updatedNote };
}

export async function togglePinNote(id: string): Promise<Note> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();

    // Get fresh data from sheet
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Notes!A2:G",
    });

    const values = response.data.values || [];
    let rowIndex = -1;
    let existingRow: string[] = [];

    for (let i = 0; i < values.length; i++) {
        if (values[i][0] === id) {
            rowIndex = i;
            existingRow = values[i];
            break;
        }
    }

    if (rowIndex === -1) {
        throw new Error("Note not found");
    }

    // Get current pin status: '1' = pinned, '0' = not pinned
    const currentPinStatus = existingRow[6] === '1' ? 1 : 0;
    const newPinStatus = currentPinStatus === 1 ? 0 : 1; // Toggle between 1 and 0
    
    console.log('========== TOGGLE PIN DEBUG ==========');
    console.log('Note ID:', id);
    console.log('Current pin status:', currentPinStatus);
    console.log('New pin status:', newPinStatus);
    console.log('Row index:', rowIndex + 2);
    
    // Update ONLY the pin column (column G) with '1' or '0'
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Notes!G${rowIndex + 2}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { 
            values: [[newPinStatus === 1 ? '1' : '0']] 
        },
    });
    
    // Also update updatedAt timestamp (column F)
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Notes!F${rowIndex + 2}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { 
            values: [[new Date().toISOString()]] 
        },
    });

    // Clear cache completely
    clearSheetCache();
    notesCache = null;
    cacheTimestamp = 0;
    
    // Create updated note object
    const updatedNote: Note = {
        id: id,
        title: existingRow[1] || "",
        content: existingRow[2] || "",
        tags: existingRow[3] || "",
        createdAt: existingRow[4] || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: newPinStatus,
    };
    
    console.log('Returning updated note:', updatedNote);
    console.log('=====================================');
    
    return updatedNote;
}

export async function deleteNote(id: string): Promise<void> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Notes!A2:G",
    });

    const values = response.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < values.length; i++) {
        if (values[i][0] === id) {
            rowIndex = i;
            break;
        }
    }

    if (rowIndex === -1) {
        throw new Error("Note not found");
    }

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const notesSheetId = spreadsheet.data.sheets?.find(
        sheet => sheet.properties?.title === "Notes"
    )?.properties?.sheetId;

    if (notesSheetId === undefined) {
        throw new Error("Notes sheet not found");
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: notesSheetId,
                        dimension: "ROWS",
                        startIndex: rowIndex + 1,
                        endIndex: rowIndex + 2,
                    }
                }
            }]
        }
    });

    clearSheetCache();
}

export async function deleteMultipleNotes(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Notes!A2:G",
    });

    const values = response.data.values || [];

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const notesSheetId = spreadsheet.data.sheets?.find(
        sheet => sheet.properties?.title === "Notes"
    )?.properties?.sheetId;

    if (notesSheetId === undefined) {
        throw new Error("Notes sheet not found");
    }

    const rowsToDelete = ids
        .map(id => {
            const index = values.findIndex(row => row[0] === id);
            return index !== -1 ? index + 1 : -1;
        })
        .filter(index => index !== -1)
        .sort((a, b) => b - a);

    if (rowsToDelete.length === 0) return;

    const requests = rowsToDelete.map(startIndex => ({
        deleteDimension: {
            range: {
                sheetId: notesSheetId,
                dimension: "ROWS",
                startIndex: startIndex,
                endIndex: startIndex + 1,
            }
        }
    }));

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
    });

    clearSheetCache();
}

// Tag functions (giữ nguyên)
function rowToTag(row: string[]): Tag {
    return {
        id: row[0] || "",
        name: row[1] || "",
        color: row[2] || "#3B82F6",
        createdAt: row[3] || new Date().toISOString(),
        updatedAt: row[4] || new Date().toISOString(),
    };
}

function tagToRow(tag: Tag): string[] {
    return [
        tag.id,
        tag.name,
        tag.color,
        tag.createdAt,
        tag.updatedAt,
    ];
}

export async function getAllTags(): Promise<Tag[]> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        console.error("SPREADSHEET_ID is not defined");
        return [];
    }

    const sheets = await getSheets();
    await ensureSheetExists(spreadsheetId, "Tags");

    try {
        const headerCheck = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Tags!A1:E1",
        });

        if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "Tags!A1:E1",
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [TAG_SHEET_HEADERS] },
            });
            return [];
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Tags!A2:E",
        });

        const values = response.data.values || [];
        const tags: Tag[] = values
            .map((row: string[]) => rowToTag(row))
            .filter((tag: Tag) => tag.id);

        return tags;
    } catch (error) {
        console.error("Error getting tags:", error);
        return [];
    }
}

export async function addTag(tag: Tag): Promise<Tag> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();
    await ensureSheetExists(spreadsheetId, "Tags");

    const newTag: Tag = {
        ...tag,
        id: tag.id || Date.now().toString(),
        createdAt: tag.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Tags!A1:E1",
    });

    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Tags!A1:E1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [TAG_SHEET_HEADERS] },
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Tags!A:E",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [tagToRow(newTag)] },
    });

    clearSheetCache();
    return { ...newTag };
}

export async function updateTag(tag: Tag): Promise<Tag> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();
    const tags = await getAllTags();
    const rowIndex = tags.findIndex((t) => t.id === tag.id);

    if (rowIndex === -1) {
        throw new Error("Tag not found");
    }

    const updatedTag: Tag = {
        ...tag,
        updatedAt: new Date().toISOString(),
    };

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Tags!A${rowIndex + 2}:E${rowIndex + 2}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [tagToRow(updatedTag)] },
    });

    clearSheetCache();
    return { ...updatedTag };
}

export async function deleteTag(id: string): Promise<void> {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
        throw new Error("SPREADSHEET_ID is not defined");
    }

    const sheets = await getSheets();
    const tags = await getAllTags();
    const rowIndex = tags.findIndex((t) => t.id === id);

    if (rowIndex === -1) {
        throw new Error("Tag not found");
    }

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const tagsSheetId = spreadsheet.data.sheets?.find(
        sheet => sheet.properties?.title === "Tags"
    )?.properties?.sheetId;

    if (tagsSheetId === undefined) {
        throw new Error("Tags sheet not found");
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: tagsSheetId,
                        dimension: "ROWS",
                        startIndex: rowIndex + 1,
                        endIndex: rowIndex + 2,
                    }
                }
            }]
        }
    });

    clearSheetCache();
}