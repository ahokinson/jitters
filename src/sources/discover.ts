import type { DataSource } from "@/domain/types.ts";
import { createClaudeCodeSource } from "@/sources/claude.ts";
import { createOpenCodeSource } from "@/sources/opencode.ts";

export interface SourceEntry {
  readonly name: string;
  readonly description: string;
  create(): DataSource;
}

export const registry: SourceEntry[] = [
  {
    name: "Claude Code",
    description: "~/.claude/projects/**/*.jsonl",
    create: createClaudeCodeSource,
  },
  {
    name: "OpenCode",
    description: "~/.local/share/opencode/opencode.db",
    create: createOpenCodeSource,
  },
];

export function discoverSources(): DataSource[] {
  return registry.map((entry) => entry.create()).filter((source) => source.available());
}
