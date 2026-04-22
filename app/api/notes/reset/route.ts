import { NextResponse } from "next/server";
import { clearSheetCache } from "../../../lib/googleSheets";

export async function POST() {
    clearSheetCache();
    return NextResponse.json({ success: true, message: "Cache cleared" });
}