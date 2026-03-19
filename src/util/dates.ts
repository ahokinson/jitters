export function daysAgo(count: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - count);
  return date;
}

export function startOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfWeek(): Date {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay());
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toHourKey(date: Date): string {
  return `${toDateKey(date)}T${String(date.getHours()).padStart(2, "0")}`;
}

export function dateKeyFromHourKey(hourKey: string): string {
  return hourKey.slice(0, 10);
}
