import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { DataSource, FetchResult, UsageEntry } from "@/domain/types.ts";
import { daysAgo } from "@/util/dates.ts";

const dbPath = join(homedir(), ".local", "share", "opencode", "opencode.db");

interface MessageRow {
  session_id: string;
  time_created: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read: number;
  cache_write: number;
  cost: number;
}

async function fetchEntries(): Promise<FetchResult> {
  const database = Database.open(`file:${dbPath}?mode=ro&immutable=1`);
  try {
    const rows = database
      .query<MessageRow, [number]>(
        `
        SELECT
          session_id,
          time_created,
          json_extract(data, '$.modelID') as model,
          json_extract(data, '$.tokens.input') as input_tokens,
          json_extract(data, '$.tokens.output') as output_tokens,
          json_extract(data, '$.tokens.cache.read') as cache_read,
          json_extract(data, '$.tokens.cache.write') as cache_write,
          json_extract(data, '$.cost') as cost
        FROM message
        WHERE time_created >= ? AND json_extract(data, '$.role') = 'assistant'
        ORDER BY time_created
      `,
      )
      .all(daysAgo(30).getTime());

    const entries: UsageEntry[] = rows.map((row) => {
      const created = new Date(row.time_created);
      return {
        timestamp: created.toISOString(),
        model: row.model ?? "unknown",
        sessionId: row.session_id ?? "",
        cost: row.cost ?? 0,
        tokens: {
          input: row.input_tokens ?? 0,
          output: row.output_tokens ?? 0,
          cacheRead: row.cache_read ?? 0,
          cacheWrite: row.cache_write ?? 0,
        },
      };
    });

    return { entries, warnings: [] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { entries: [], warnings: [`Failed to query OpenCode database: ${msg}`] };
  } finally {
    database.close();
  }
}

export function createOpenCodeSource(): DataSource {
  let cached: Promise<FetchResult> | null = null;

  return {
    name: "OpenCode",

    available() {
      return existsSync(dbPath);
    },

    fetchEntries() {
      if (!cached) cached = fetchEntries();
      return cached;
    },
  };
}
