export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const SHORT_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const mondayShift = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayShift + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return DAY_NAMES.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function isToday(date: Date): boolean {
  const t = new Date();
  return (
    date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
  );
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(dateISO: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatWeekRange(dates: Date[]): string {
  const s = dates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const e = dates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${s} – ${e}`;
}

export function isPastDate(dateISO: string, todayISO: string): boolean {
  return dateISO < todayISO;
}

export function dayIdxOf(date: Date): number {
  const dow = date.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function todayISO(): string {
  return toISODate(new Date());
}
