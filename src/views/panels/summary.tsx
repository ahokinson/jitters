import { For } from "solid-js";
import { formatTokens } from "@/domain/tokens.ts";
import type { IntervalUsage } from "@/domain/types.ts";
import { colors } from "@/util/colors.ts";
import { formatCompactNumber, formatCost, padLeft, padRight } from "@/util/format.ts";

interface SummaryPanelProps {
  sourceName: string;
  intervals: IntervalUsage[];
  contentWidth: number;
}

function layout(contentWidth: number) {
  const columnWidth = contentWidth >= 70 ? 8 : 7;
  const dataCols = 4;
  const gaps = dataCols;
  const labelWidth = Math.max(contentWidth - dataCols * columnWidth - gaps, 10);
  return { columnWidth, labelWidth };
}

export function SummaryPanel(props: SummaryPanelProps) {
  const columns = () => layout(props.contentWidth);

  return (
    <box
      flexDirection="column"
      borderStyle="rounded"
      borderColor={colors.border}
      title={` ${props.sourceName} `}
      titleAlignment="left"
      paddingX={1}
      paddingY={1}
    >
      <box flexDirection="column">
        <For each={props.intervals}>
          {(period) => (
            <box flexDirection="row" gap={1}>
              <text fg={colors.label}>{padRight(period.label, columns().labelWidth)}</text>
              <text fg={colors.sessions}>
                {padLeft(String(period.sessions), columns().columnWidth)}
              </text>
              <text fg={colors.messages}>
                {padLeft(formatCompactNumber(period.messages), columns().columnWidth)}
              </text>
              <text fg={colors.tokens}>
                {padLeft(formatTokens(period.tokens), columns().columnWidth)}
              </text>
              <text fg={colors.cost}>
                {padLeft(formatCost(period.cost), columns().columnWidth)}
              </text>
            </box>
          )}
        </For>
      </box>
    </box>
  );
}
