import { useTerminalDimensions } from "@opentui/solid";
import { For, type JSX } from "solid-js";
import { totalTokens } from "@/domain/tokens.ts";
import type { SourceData, TokenCount } from "@/domain/types.ts";
import { DailyChart } from "@/views/charts/daily.tsx";
import { VelocityChart } from "@/views/charts/velocity.tsx";
import { SummaryPanel } from "@/views/panels/summary.tsx";
import { ModelTable } from "@/views/tables/models.tsx";

interface DashboardProps {
  sources: SourceData[];
}

function peakTokens<T>(
  sources: SourceData[],
  select: (source: SourceData) => T[],
  tokens: (item: T) => TokenCount,
): number {
  let max = 1;
  for (const source of sources) {
    for (const item of select(source)) {
      const total = totalTokens(tokens(item));
      if (total > max) max = total;
    }
  }
  return max;
}

function SourceRow(props: {
  sources: SourceData[];
  children: (source: SourceData) => JSX.Element;
}) {
  return (
    <box flexDirection="row" gap={1}>
      <For each={props.sources}>{(source) => <box flexGrow={1}>{props.children(source)}</box>}</For>
    </box>
  );
}

export function Dashboard(props: DashboardProps) {
  const dimensions = useTerminalDimensions();

  const columnWidth = () => {
    const numCols = props.sources.length;
    const outerPad = 2;
    const gaps = numCols - 1;
    const borderAndPad = 4;
    return Math.floor((dimensions().width - outerPad - gaps) / numCols) - borderAndPad;
  };

  const peakHourlyTokens = () =>
    peakTokens(
      props.sources,
      (source) => source.hourly,
      (hour) => hour.tokens,
    );

  const peakDailyTokens = () =>
    peakTokens(
      props.sources,
      (source) => source.daily,
      (day) => day.tokens,
    );

  return (
    <box flexDirection="column" gap={1}>
      <SourceRow sources={props.sources}>
        {(source) => (
          <SummaryPanel
            sourceName={source.name}
            intervals={source.intervals}
            contentWidth={columnWidth()}
          />
        )}
      </SourceRow>
      <SourceRow sources={props.sources}>
        {(source) => (
          <VelocityChart
            title={`${source.name} — Velocity`}
            hours={source.hourly}
            contentWidth={columnWidth()}
            sharedPeak={peakHourlyTokens()}
          />
        )}
      </SourceRow>
      <SourceRow sources={props.sources}>
        {(source) => (
          <DailyChart
            title={`${source.name} — Last 7 Days`}
            days={source.daily}
            contentWidth={columnWidth()}
            sharedMax={peakDailyTokens()}
          />
        )}
      </SourceRow>
      <SourceRow sources={props.sources}>
        {(source) => (
          <ModelTable
            title={`${source.name} — Models`}
            models={source.models}
            contentWidth={columnWidth()}
          />
        )}
      </SourceRow>
    </box>
  );
}
