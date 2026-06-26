export const DEPARTMENT_LABELS: Record<string, string> = {
  ARCHITECTURE: "สถาปัตยกรรมศาสตร์",
  INTERIOR_ARCHITECTURE: "สถาปัตยกรรมภายใน",
  LANDSCAPE_ARCHITECTURE: "ภูมิสถาปัตยกรรม",
  INDUSTRIAL_DESIGN: "การออกแบบอุตสาหกรรม",
  URBAN_PLANNING: "การวางแผนภาคและผังเมือง",
  COMMDE: "CommDe",
  INDA: "INDA",
  THAI_ARCHITECTURE: "สถาปัตยกรรมไทย",
  GRADUATE: "นิสิตเก่าปริญญาโท",
};

export const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function getDeptLabel(dept: string): string {
  return DEPARTMENT_LABELS[dept] ?? dept;
}

export function getGeneration(yearOfEntry: number): number {
  return yearOfEntry - 2475;
}
