import ImportWizard from "./ImportWizard";

export default function ImportPage() {
  return (
    <div className="flex-1 bg-sepia-bg px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">นำเข้าสมาชิกจาก CSV</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            อัปโหลดไฟล์ CSV จาก Google Sheets เพื่อนำเข้าสมาชิกเป็นจำนวนมาก
          </p>
        </div>

        {/* Column guide */}
        <details className="rounded-lg border border-sepia-pale/60 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-sepia select-none">
            รูปแบบ CSV ที่รองรับ
          </summary>
          <div className="border-t border-sepia-pale/40 px-4 py-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-sepia-mid">
                  <th className="pb-2 pr-4">คอลัมน์</th>
                  <th className="pb-2 pr-4">ข้อมูล</th>
                  <th className="pb-2">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["A", "Timestamp", "ไม่ใช้"],
                  ["B", "Email Address (Form)", "ไม่ใช้"],
                  ["C", "ชื่อ-นามสกุล (รวม)", "ไม่ใช้ — ใช้ D+E แทน"],
                  ["D", "ชื่อ (ภาษาไทย)", "จำเป็น"],
                  ["E", "นามสกุล (ภาษาไทย)", "จำเป็น"],
                  ["F", "ชื่อเล่น", "ไม่บังคับ"],
                  ["G", "อีเมล", "ไม่บังคับ"],
                  ["H", "โทรศัพท์", "ไม่บังคับ"],
                  ["I", "ปีที่เข้าศึกษา พ.ศ.", "จำเป็น เช่น 2540"],
                  ["J", "สาขา", "จำเป็น เช่น สถ, ARCHITECTURE, Interior"],
                  ["K", "อาชีพ", "ไม่บังคับ"],
                  ["L", "ที่ทำงาน", "ไม่บังคับ"],
                  ["M", "ความยินยอม", "\"ยอมรับ\" = true"],
                ].map(([col, field, note]) => (
                  <tr key={col} className="border-t border-sepia-pale/20">
                    <td className="py-1.5 pr-4 font-mono text-sepia-dark">{col}</td>
                    <td className="py-1.5 pr-4">{field}</td>
                    <td className="py-1.5 text-muted-foreground/70">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className="rounded-lg border border-sepia-pale/60 bg-white p-6">
          <ImportWizard />
        </div>
      </div>
    </div>
  );
}
