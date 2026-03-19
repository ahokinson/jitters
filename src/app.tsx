import { useKeyboard, useTerminalDimensions } from "@opentui/solid";
import { createSignal, onMount } from "solid-js";
import { aggregate } from "@/domain/aggregate.ts";
import type { DataSource, SourceData } from "@/domain/types.ts";
import { colors } from "@/util/colors.ts";
import { Dashboard } from "@/views/dashboard.tsx";

interface AppProps {
  sources: DataSource[];
}

export function App(props: AppProps) {
  const dimensions = useTerminalDimensions();
  const [data, setData] = createSignal<SourceData[]>([]);
  const [warnings, setWarnings] = createSignal<string[]>([]);
  const [status, setStatus] = createSignal("loading...");

  const velocityHours = () => {
    const numCols = props.sources.length;
    const columnWidth = Math.floor((dimensions().width - 2 - (numCols - 1)) / numCols) - 4;
    return Math.max(columnWidth - 6, 168);
  };

  async function refresh() {
    setStatus("refreshing...");
    try {
      const hours = velocityHours();
      const results = await Promise.all(
        props.sources.map(async (source) => {
          const result = await source.fetchEntries();
          return aggregate(source.name, result, hours);
        }),
      );
      setData(results);
      const allWarnings = results.flatMap((result) => result.warnings);
      setWarnings(allWarnings);
      setStatus(`${results.length} source${results.length !== 1 ? "s" : ""}`);
    } catch (error) {
      setStatus(`error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") process.exit(0);
    if (key.name === "r") refresh();
  });

  onMount(() => refresh());

  return (
    <box flexDirection="column" paddingX={1} paddingTop={1}>
      {data().length > 0 ? (
        <Dashboard sources={data()} />
      ) : (
        <text fg={colors.muted}>{status()}</text>
      )}

      <box flexDirection="row" justifyContent="space-between" paddingTop={1}>
        <box flexDirection="row" gap={1}>
          <text fg={colors.accent}>r</text>
          <text fg={colors.dim}>Refresh</text>
          <text fg={colors.accent}>q</text>
          <text fg={colors.dim}>Quit</text>
          {warnings().length > 0 && (
            <>
              <text fg={colors.messages}>!</text>
              <text fg={colors.dim}>
                {warnings().length} warning{warnings().length !== 1 ? "s" : ""}
              </text>
            </>
          )}
        </box>
        <box flexDirection="row" gap={1}>
          <text fg={colors.sessions}>{"\u2588"}</text>
          <text fg={colors.dim}>Sessions</text>
          <text fg={colors.messages}>{"\u2588"}</text>
          <text fg={colors.dim}>Messages</text>
          <text fg={colors.tokens}>{"\u2588"}</text>
          <text fg={colors.dim}>Tokens</text>
          <text fg={colors.cost}>{"\u2588"}</text>
          <text fg={colors.dim}>Cost</text>
        </box>
      </box>
    </box>
  );
}
