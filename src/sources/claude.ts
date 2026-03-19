import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Glob } from "bun";
import type { DataSource, FetchResult, UsageEntry } from "@/domain/types.ts";
import { daysAgo, toDateKey } from "@/util/dates.ts";

interface RawUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

interface RawAssistantEntry {
  type: string;
  requestId?: string;
  timestamp?: string;
  sessionId?: string;
  message?: { model?: string; usage?: RawUsage };
}

const projectsDir = join(homedir(), ".claude", "projects");

async function fetchEntries(): Promise<FetchResult> {
  const entries: UsageEntry[] = [];
  const warnings: string[] = [];
  const cutoff = toDateKey(daysAgo(30));

  const glob = new Glob("**/*.jsonl");
  const files = glob.scanSync({ cwd: projectsDir, absolute: true });

  for (const filePath of files) {
    let text: string;
    try {
      text = await Bun.file(filePath).text();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      warnings.push(`Failed to read ${filePath}: ${msg}`);
      continue;
    }

    const byRequestId = new Map<
      string,
      { model: string; timestamp: string; sessionId: string; usage: RawUsage }
    >();

    for (const line of text.split("\n")) {
      if (!line.includes('"type":"assistant"')) continue;

      let obj: unknown;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }
      if (typeof obj !== "object" || obj === null) continue;

      const entry = obj as RawAssistantEntry;
      if (entry.type !== "assistant") continue;
      if (!entry.requestId || !entry.message?.usage) continue;

      byRequestId.set(entry.requestId, {
        model: entry.message.model ?? "unknown",
        timestamp: entry.timestamp ?? "",
        sessionId: entry.sessionId ?? "",
        usage: entry.message.usage,
      });
    }

    for (const raw of byRequestId.values()) {
      const date = raw.timestamp.slice(0, 10);
      if (!date || date < cutoff) continue;

      entries.push({
        timestamp: raw.timestamp,
        model: raw.model,
        sessionId: raw.sessionId,
        cost: 0,
        tokens: {
          input: raw.usage.input_tokens ?? 0,
          output: raw.usage.output_tokens ?? 0,
          cacheRead: raw.usage.cache_read_input_tokens ?? 0,
          cacheWrite: raw.usage.cache_creation_input_tokens ?? 0,
        },
      });
    }
  }

  entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return { entries, warnings };
}

export function createClaudeCodeSource(): DataSource {
  let cached: Promise<FetchResult> | null = null;

  return {
    name: "Claude Code",

    available() {
      return existsSync(projectsDir);
    },

    fetchEntries() {
      if (!cached) cached = fetchEntries();
      return cached;
    },
  };
}
