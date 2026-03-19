import { toDateKey, toHourKey } from "@/util/dates.ts";

function fillRange<T>(
  count: number,
  step: (date: Date, offset: number) => void,
  toKey: (date: Date) => string,
  lookup: Map<string, T>,
  zero: (key: string) => T,
): T[] {
  const now = new Date();
  const result: T[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    step(date, i);
    const key = toKey(date);
    result.push(lookup.get(key) ?? zero(key));
  }
  return result;
}

export function fillDays<T>(days: number, lookup: Map<string, T>, zero: (key: string) => T): T[] {
  return fillRange(
    days,
    (date, offset) => date.setDate(date.getDate() - offset),
    toDateKey,
    lookup,
    zero,
  ).reverse();
}

export function fillHours<T>(hours: number, lookup: Map<string, T>, zero: (key: string) => T): T[] {
  return fillRange(
    hours,
    (date, offset) => date.setHours(date.getHours() - offset),
    toHourKey,
    lookup,
    zero,
  );
}
