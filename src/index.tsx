#!/usr/bin/env bun
import { render } from "@opentui/solid";
import { App } from "@/app.tsx";
import { discoverSources, registry } from "@/sources/discover.ts";

const sources = discoverSources();

if (sources.length === 0) {
  console.log("jitters: no data sources found");
  console.log("  Looked for:");
  for (const entry of registry) {
    console.log(`    ${entry.description} (${entry.name})`);
  }
  process.exit(1);
}

console.log(`jitters: found ${sources.map((source) => source.name).join(", ")}`);

render(() => <App sources={sources} />);
