import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Department } from "@prisma/client";

const ALLOWED = ["ADMIN", "SUPER_ADMIN"];

type ImportRow = {
  firstNameTh: string;
  lastNameTh: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  yearOfEntry: number;
  department: string;
  occupation: string | null;
  workplace: string | null;
  consent: boolean;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ALLOWED.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  let body: { batchName: string; rows: ImportRow[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const { batchName, rows } = body;
  if (!rows?.length) {
    return NextResponse.json({ error: "ไม่มีข้อมูลที่จะนำเข้า" }, { status: 400 });
  }

  // Collect all emails to check for duplicates in one query
  const emails = rows.map((r) => r.email).filter((e): e is string => !!e);
  const existingUsers = emails.length
    ? await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      })
    : [];
  const existingEmails = new Set(existingUsers.map((u) => u.email?.toLowerCase()));

  // Create ImportBatch
  const batch = await prisma.importBatch.create({
    data: {
      name: batchName || `Import ${new Date().toLocaleDateString("th-TH")}`,
      totalRows: rows.length,
      importedCount: 0,
      skippedCount: 0,
      importedBy: session.user.id,
    },
  });

  let imported = 0;
  let skipped = 0;
  const errors: { name: string; reason: string }[] = [];

  for (const row of rows) {
    const emailKey = row.email?.toLowerCase() ?? null;

    // Skip duplicate emails
    if (emailKey && existingEmails.has(emailKey)) {
      skipped++;
      continue;
    }

    try {
      // birthDate placeholder: Jan 1 of ~entry year in CE
      const ceYear = row.yearOfEntry - 543;
      const birthDate = new Date(Date.UTC(ceYear - 22, 0, 1));

      await prisma.user.create({
        data: {
          email: emailKey || null,
          accountStatus: "UNACTIVATED",
          consentGiven: row.consent,
          consentAt: row.consent ? new Date() : null,
          member: {
            create: {
              firstNameTh: row.firstNameTh,
              lastNameTh: row.lastNameTh,
              nickname: row.nickname,
              birthDate,
              department: row.department as Department,
              yearOfEntry: row.yearOfEntry,
              phone: row.phone,
              occupation: row.occupation,
              workplace: row.workplace,
              status: "ACTIVE",
              dataSource: "IMPORTED",
              importBatchId: batch.id,
            },
          },
        },
      });

      if (emailKey) existingEmails.add(emailKey);
      imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ name: `${row.firstNameTh} ${row.lastNameTh}`, reason: msg });
    }
  }

  // Update batch counts
  await prisma.importBatch.update({
    where: { id: batch.id },
    data: { importedCount: imported, skippedCount: skipped + errors.length },
  });

  void prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "IMPORT_MEMBERS",
      targetType: "ImportBatch",
      targetId: batch.id,
      after: { imported, skipped, errorCount: errors.length },
    },
  });

  return NextResponse.json({ imported, skipped, errors, batchId: batch.id });
}
