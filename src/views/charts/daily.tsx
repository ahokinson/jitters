import { For } from "solid-js";
import { totalTokens } from "@/domain/tokens.ts";
import type { DailyUsage } from "@/domain/types.ts";
import { colors } from "@/util/colors.ts";
import { formatCompactNumber, formatDate, padLeft } from "@/util/format.ts";

interface DailyChartProps {
  title: string;
  days: DailyUsage[];
  contentWidth: number;
  sharedMax?: number;
}

const DATE_WIDTH = 7;
const SESSION_WIDTH = 3;
const MESSAGE_WIDTH = 4;
const TOKEN_WIDTH = 6;
const SPACES = 4;
const FIXED_WIDTH = DATE_WIDTH + SESSION_WIDTH + MESSAGE_WIDTH + TOKEN_WIDTH + SPACES;

function barString(total: number, maxValue: number, width: number): string {
  const safeWidth = Math.max(width, 0);
  const ratio = maxValue > 0 ? total / maxValue : 0;
  const filled = Math.round(ratio * safeWidth);
  return "\u2588".repeat(filled) + "\u2591".repeat(safeWidth - filled);
}

export function DailyChart(props: DailyChartProps) {
  const barWidth = () => Math.max(props.contentWidth - FIXED_WIDTH, 4);
  const maxTokens = () => {
    if (props.sharedMax) return props.sharedMax;
    const vals = props.days.map((day) => totalTokens(day.tokens));
    return Math.max(...vals, 1);
  };

  return (
    <box
      flexDirection="column"
      borderStyle="rounded"
      borderColor={colors.border}
      title={` ${props.title} `}
      titleAlignment="left"
      paddingX={1}
      paddingY={1}
    >
      <For each={props.days}>
        {(day) => {
          const total = totalTokens(day.tokens);
          return (
            <box flexDirection="row">
              <text fg={colors.dim}>{formatDate(day.date).padEnd(DATE_WIDTH)} </text>
              <text fg={colors.chart}>{barString(total, maxTokens(), barWidth())} </text>
              <text fg={colors.sessions}>{padLeft(String(day.sessions), SESSION_WIDTH)} </text>
              <text fg={colors.messages}>{padLeft(String(day.messages), MESSAGE_WIDTH)} </text>
              <text fg={colors.tokens}>{padLeft(formatCompactNumber(total), TOKEN_WIDTH)}</text>
            </box>
          );
        }}
      </For>
    </box>
  );
}
