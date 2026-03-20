export function getProgressColor(actual: number, expected: number): string {
  if (!expected || expected === 0) return "#9CA3AF";
  const ratio = actual / expected;
  if (ratio >= 1) return "#16A34A";
  if (ratio >= 0.1) return "#F59E0B";
  return "#DC2626";
}

export function getProgressTextColor(actual: number, expected: number): string {
  if (!expected || expected === 0) return "#9CA3AF";
  const ratio = actual / expected;
  if (ratio >= 1) return "#16A34A";
  if (ratio >= 0.1) return "#D97706";
  return "#DC2626";
}

export function isEmpty(val: any): boolean {
  return (
    val === null ||
    val === undefined ||
    String(val).trim() === "" ||
    String(val).trim() === "-"
  );
}

export function absFromRelative(rel: string, baseUrl: string) {
  if (!rel) return "";
  if (!rel.startsWith("/")) return rel;

  try {
    const u = new URL(baseUrl);
    return `${u.origin}${rel}`;
  } catch {
    const origin = baseUrl.replace(/\/api\/?$/, "");
    return `${origin}${rel}`;
  }
}

export function normalizeBoolLike(val: any) {
  if (val === true) return "Yes";
  if (val === false) return "No";
  return val;
}
