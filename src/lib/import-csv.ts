// Department keyword → enum code mapping (case-insensitive, trimmed)
export const DEPT_KEYWORD_MAP: Record<string, string[]> = {
  ARCHITECTURE: ["สถ", "สถ.", "สถาปัตยกรรมศาสตร์", "สถาปัตยกรรม", "arch", "architecture"],
  INTERIOR_ARCHITECTURE: ["สน", "สน.", "ia", "สถาปัตยกรรมภายใน", "สถาปัตย์ภายใน", "interior"],
  LANDSCAPE_ARCHITECTURE: ["ภส", "แลนด์", "land", "landscape", "ภูมิสถาปัตยกรรม", "ภูมิสถาปัตย์"],
  INDUSTRIAL_DESIGN: ["id", "ไอดี", "การออกแบบอุตสาหกรรม", "industrial design"],
  URBAN_PLANNING: ["ผม", "ผังเมือง", "การวางแผนภาคและผังเมือง", "การวางแผนภาคและเมือง", "urban planning"],
  COMMDE: ["commde"],
  INDA: ["inda"],
  THAI_ARCHITECTURE: ["สถท", "สถ.ท.", "สถาปัตยกรรมไทย", "thai architecture"],
  GRADUATE: ["ป.โท", "ปริญญาโท", "graduate", "master", "masters"],
};

export function mapDepartment(raw: string): string | null {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return null;
  for (const [code, keywords] of Object.entries(DEPT_KEYWORD_MAP)) {
    if (keywords.some((kw) => kw.toLowerCase() === normalized)) {
      return code;
    }
  }
  return null;
}

// Minimal RFC-4180 CSV parser (handles quoted fields, CRLF + LF)
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuote = false;
  const n = text.length;

  for (let i = 0; i < n; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\r" && next === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
      } else if (ch === "\n" || ch === "\r") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }

  // Push last field/row
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing empty row (common with trailing newline)
  if (rows.length && rows[rows.length - 1].every((c) => !c.trim())) {
    rows.pop();
  }

  return rows;
}

export type ParsedRow = {
  index: number;
  firstNameTh: string;
  lastNameTh: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  yearOfEntry: number | null;
  department: string | null;
  departmentRaw: string;
  occupation: string | null;
  workplace: string | null;
  consent: boolean;
  status: "ready" | "needs_review" | "error";
  errors: string[];
};

function col(row: string[], idx: number): string {
  return (row[idx] ?? "").trim();
}

// Parse all data rows (skip header row 0)
export function parseImportRows(rows: string[][]): ParsedRow[] {
  // Detect if first row is a header (non-numeric in column I / index 8)
  const startIdx = rows.length > 0 && isNaN(Number(col(rows[0], 8))) ? 1 : 0;

  return rows.slice(startIdx).map((row, i) => {
    const index = startIdx + i + 1;
    const firstNameTh = col(row, 3);
    const lastNameTh = col(row, 4);
    const nickname = col(row, 5) || null;
    const email = col(row, 6).toLowerCase() || null;
    const phone = col(row, 7) || null;
    const yearRaw = col(row, 8);
    const yearOfEntry = yearRaw ? parseInt(yearRaw, 10) : null;
    const departmentRaw = col(row, 9);
    const department = mapDepartment(departmentRaw);
    const occupation = col(row, 10) || null;
    const workplace = col(row, 11) || null;
    const consentRaw = col(row, 12);
    const consent = consentRaw === "ยอมรับ";

    const errors: string[] = [];
    if (!firstNameTh) errors.push("ไม่มีชื่อ");
    if (!lastNameTh) errors.push("ไม่มีนามสกุล");
    if (!yearOfEntry || isNaN(yearOfEntry) || yearOfEntry < 2400 || yearOfEntry > 2600)
      errors.push("ปีที่เข้าศึกษาไม่ถูกต้อง");

    let status: ParsedRow["status"];
    if (errors.length > 0) {
      status = "error";
    } else if (!department) {
      status = "needs_review";
    } else {
      status = "ready";
    }

    return {
      index,
      firstNameTh,
      lastNameTh,
      nickname,
      email,
      phone,
      yearOfEntry,
      department,
      departmentRaw,
      occupation,
      workplace,
      consent,
      status,
      errors,
    };
  });
}
