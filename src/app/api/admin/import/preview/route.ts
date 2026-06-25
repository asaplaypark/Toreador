import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { parseCsv, parseImportRows } from "@/lib/import-csv";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "อ่านข้อมูลไม่ได้" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "กรุณาแนบไฟล์ CSV" }, { status: 400 });
  }

  const text = await file.text();
  const rawRows = parseCsv(text);

  if (rawRows.length === 0) {
    return NextResponse.json({ error: "ไฟล์ว่างเปล่า" }, { status: 400 });
  }

  const rows = parseImportRows(rawRows);
  // Return raw preview rows (first 5) + all parsed rows
  const previewRaw = rawRows.slice(0, 6); // including header

  return NextResponse.json({ rows, previewRaw });
}
