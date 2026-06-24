function dateSuffix(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

function rand7(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function generateSlug(_title: string): string {
  return `news-${rand7()}-${dateSuffix()}`;
}

export function generateActivitySlug(_title: string): string {
  return `activity-${rand7()}-${dateSuffix()}`;
}
