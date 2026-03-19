# Contributing

## Development Setup

Prerequisites:

- [Bun](https://bun.sh)
- [Task](https://taskfile.dev)

```bash
# Install dependencies
task deps

# Run in development
task dev

# Type check
task check

# Build
task build
```

## Adding a New Data Source

1. Create a new file in `src/sources/` (e.g., `my-source.ts`)

2. Implement the `DataSource` interface:

```typescript
import type { DataSource, UsageEntry } from "@/domain/types.ts"

export function createMySource(): DataSource {
  return {
    name: "MySource",
    available() {
      // Return true if the source data exists
      return existsSync(somePath)
    },
    async fetchEntries(): Promise<UsageEntry[]> {
      // Parse your source and return entries
      return entries
    },
  }
}
```

3. Each `UsageEntry` needs:

- `timestamp` - ISO string
- `model` - model identifier
- `sessionId` - session identifier
- `tokens` - `{ input, output, cacheRead, cacheWrite }`
- `cost` - number

4. Register in `src/sources/discover.ts`:

```typescript
import { createMySource } from "@/sources/my-source.ts"

export const registry: SourceEntry[] = [
  // ...existing...
  { name: "MySource", description: "~/.path/to/data", create: createMySource },
]
```

5. Run `task dev` to verify auto-discovery works