import { addTokens, totalTokens, zeroTokens } from "@/domain/tokens.ts";
import type {
  DailyUsage,
  FetchResult,
  HourlyUsage,
  IntervalUsage,
  ModelBreakdown,
  SourceData,
  TokenCount,
  UsageEntry,
} from "@/domain/types.ts";
import { startOfMonth, startOfToday, startOfWeek, toDateKey, toHourKey } from "@/util/dates.ts";
import { fillDays, fillHours } from "@/util/fill.ts";

function toDate(timestamp: string): string {
  return toDateKey(new Date(timestamp));
}

function buildIntervals(entries: UsageEntry[]): IntervalUsage[] {
  const intervals = [
    { label: "Day", since: toDateKey(startOfToday()) },
    { label: "Week", since: toDateKey(startOfWeek()) },
    { label: "Month", since: toDateKey(startOfMonth()) },
  ];

  return intervals.map(({ label, since }) => {
    let tokens = zeroTokens();
    let messages = 0;
    let cost = 0;
    const sessions = new Set<string>();

    for (const entry of entries) {
      const date = toDate(entry.timestamp);
      if (date >= since) {
        tokens = addTokens(tokens, entry.tokens);
        cost += entry.cost;
        messages++;
        if (entry.sessionId) sessions.add(entry.sessionId);
      }
    }

    return { label, sessions: sessions.size, messages, tokens, cost };
  });
}

function buildDaily(entries: UsageEntry[], days: number): DailyUsage[] {
  const cutoff = toDateKey(new Date(Date.now() - days * 86_400_000));
  const byDate = new Map<string, { messages: number; tokens: TokenCount; sessions: Set<string> }>();

  for (const entry of entries) {
    const date = toDate(entry.timestamp);
    if (date < cutoff) continue;

    const existing = byDate.get(date);
    if (existing) {
      existing.messages++;
      existing.tokens = addTokens(existing.tokens, entry.tokens);
      if (entry.sessionId) existing.sessions.add(entry.sessionId);
    } else {
      const sessions = new Set<string>();
      if (entry.sessionId) sessions.add(entry.sessionId);
      byDate.set(date, { messages: 1, tokens: entry.tokens, sessions });
    }
  }

  const lookup = new Map(
    [...byDate].map(([date, data]) => [
      date,
      {
        date,
        messages: data.messages,
        sessions: data.sessions.size,
        tokens: data.tokens,
      } as DailyUsage,
    ]),
  );

  return fillDays(days, lookup, (key) => ({
    date: key,
    messages: 0,
    sessions: 0,
    tokens: zeroTokens(),
  }));
}

function buildHourly(entries: UsageEntry[], hours: number): HourlyUsage[] {
  const cutoff = toHourKey(new Date(Date.now() - hours * 3_600_000));
  const lookup = new Map<string, HourlyUsage>();

  for (const entry of entries) {
    const key = toHourKey(new Date(entry.timestamp));
    if (key < cutoff) continue;

    const existing = lookup.get(key);
    lookup.set(key, {
      hour: key,
      messages: (existing?.messages ?? 0) + 1,
      tokens: addTokens(existing?.tokens ?? zeroTokens(), entry.tokens),
    });
  }

  return fillHours(hours, lookup, (key) => ({ hour: key, messages: 0, tokens: zeroTokens() }));
}

function buildModels(entries: UsageEntry[]): ModelBreakdown[] {
  const byModel = new Map<string, { tokens: TokenCount; cost: number }>();

  for (const entry of entries) {
    const existing = byModel.get(entry.model);
    byModel.set(entry.model, {
      tokens: addTokens(existing?.tokens ?? zeroTokens(), entry.tokens),
      cost: (existing?.cost ?? 0) + entry.cost,
    });
  }

  return [...byModel.entries()]
    .map(([model, { tokens, cost }]) => ({ model, tokens, cost }))
    .sort((a, b) => totalTokens(b.tokens) - totalTokens(a.tokens));
}

export function aggregate(name: string, result: FetchResult, hours: number): SourceData {
  return {
    name,
    intervals: buildIntervals(result.entries),
    daily: buildDaily(result.entries, 7),
    hourly: buildHourly(result.entries, hours),
    models: buildModels(result.entries),
    warnings: result.warnings,
  };
}
