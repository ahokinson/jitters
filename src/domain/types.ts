export interface TokenCount {
  readonly input: number;
  readonly output: number;
  readonly cacheRead: number;
  readonly cacheWrite: number;
}

export interface UsageEntry {
  readonly timestamp: string;
  readonly model: string;
  readonly sessionId: string;
  readonly tokens: TokenCount;
  readonly cost: number;
}

export interface IntervalUsage {
  readonly label: string;
  readonly sessions: number;
  readonly messages: number;
  readonly tokens: TokenCount;
  readonly cost: number;
}

export interface DailyUsage {
  readonly date: string;
  readonly messages: number;
  readonly sessions: number;
  readonly tokens: TokenCount;
}

export interface HourlyUsage {
  readonly hour: string; // e.g. "2026-03-18T14"
  readonly messages: number;
  readonly tokens: TokenCount;
}

export interface ModelBreakdown {
  readonly model: string;
  readonly tokens: TokenCount;
  readonly cost: number;
}

export interface FetchResult {
  readonly entries: UsageEntry[];
  readonly warnings: string[];
}

export interface DataSource {
  readonly name: string;
  available(): boolean;
  fetchEntries(): Promise<FetchResult>;
}

export interface SourceData {
  readonly name: string;
  readonly intervals: IntervalUsage[];
  readonly daily: DailyUsage[];
  readonly hourly: HourlyUsage[];
  readonly models: ModelBreakdown[];
  readonly warnings: string[];
}
