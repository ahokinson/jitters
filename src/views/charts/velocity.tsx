import { For } from "solid-js";
import { totalTokens, zeroTokens } from "@/domain/tokens.ts";
import type { HourlyUsage } from "@/domain/types.ts";
import { colors } from "@/util/colors.ts";
import { dateKeyFromHourKey } from "@/util/dates.ts";
import { formatCompactNumber, formatDate, hourLabel } from "@/util/format.ts";

const CHART_ROWS = 8;
const CHART_THRESHOLD = 0.25;

interface VelocityChartProps {
  title: string;
  hours: HourlyUsage[];
  contentWidth: number;
  sharedPeak?: number;
}

const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10];

function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  for (const step of NICE_STEPS) {
    if (step >= normalized) return step * magnitude;
  }
  return 10 * magnitude;
}

interface ChartSegment {
  text: string;
  filled: boolean;
}

function chartRows(values: number[], ceiling: number): ChartSegment[][] {
  const rows: ChartSegment[][] = [];

  for (let row = CHART_ROWS - 1; row >= 0; row--) {
    const segments: ChartSegment[] = [];
    let currentText = "";
    let currentFilled = false;

    for (const [i, value] of values.entries()) {
      const filled = (value / ceiling) * CHART_ROWS;
      const fullRows = Math.floor(filled);
      const fraction = filled - fullRows;

      const isFilled = fullRows > row || (fullRows === row && fraction >= CHART_THRESHOLD);
      const char = isFilled ? "\u2588" : "\u2591";

      if (i === 0) {
        currentText = char;
        currentFilled = isFilled;
      } else if (isFilled === currentFilled) {
        currentText += char;
      } else {
        segments.push({ text: currentText, filled: currentFilled });
        currentText = char;
        currentFilled = isFilled;
      }
    }

    if (currentText) {
      segments.push({ text: currentText, filled: currentFilled });
    }

    rows.push(segments);
  }

  return rows;
}

function placeLabel(chars: string[], position: number, label: string): number {
  for (let j = 0; j < label.length && position + j < chars.length; j++) {
    chars[position + j] = label.charAt(j);
  }
  return position + label.length + 1;
}

function timeAxis(hours: HourlyUsage[]): string {
  const chars = new Array<string>(hours.length).fill(" ");
  let labelEnd = 0;

  for (const [i, entry] of hours.entries()) {
    if (i < labelEnd) continue;

    if (i % 24 === 0) {
      labelEnd = placeLabel(chars, i, formatDate(dateKeyFromHourKey(entry.hour)));
    } else if (i % 12 === 0) {
      labelEnd = placeLabel(chars, i, hourLabel(entry.hour));
    } else if (i % 6 === 0) {
      chars[i] = "\u00b7";
    }
  }

  return chars.join("");
}

export function VelocityChart(props: VelocityChartProps) {
  const peakHour = () =>
    props.hours.reduce<HourlyUsage | null>(
      (best, hour) => (!best || totalTokens(hour.tokens) > totalTokens(best.tokens) ? hour : best),
      null,
    );
  const ceiling = () =>
    niceCeiling(props.sharedPeak ?? totalTokens(peakHour()?.tokens ?? zeroTokens()));
  const axisWidth = () => {
    const topLabel = formatCompactNumber(ceiling());
    const midLabel = formatCompactNumber(ceiling() / 2);
    return Math.max(topLabel.length, midLabel.length) + 1;
  };
  const visibleHours = () => {
    const maxHours = Math.max(props.contentWidth - axisWidth(), 12);
    return props.hours.length > maxHours ? props.hours.slice(-maxHours) : props.hours;
  };
  const totals = () => visibleHours().map((hour) => totalTokens(hour.tokens));
  const currentHour = () => props.hours[props.hours.length - 1];

  const yAxisLabel = (index: number): string => {
    const width = axisWidth();
    if (index === 0) {
      return `${formatCompactNumber(ceiling())}\u2595`.padStart(width);
    }
    if (index === Math.floor(CHART_ROWS / 2)) {
      return `${formatCompactNumber(ceiling() / 2)}\u2595`.padStart(width);
    }
    return "\u2595".padStart(width);
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
      <For each={chartRows(totals(), ceiling())}>
        {(segments, i) => (
          <box flexDirection="row" gap={0}>
            <text fg={colors.dim}>{yAxisLabel(i())}</text>
            <For each={segments}>
              {(segment) => (
                <text fg={segment.filled ? colors.chart : colors.border}>{segment.text}</text>
              )}
            </For>
          </box>
        )}
      </For>
      <box flexDirection="row" gap={0}>
        <text fg={colors.dim}>
          {"".padStart(axisWidth())}
          {timeAxis(visibleHours())}
        </text>
      </box>
      <box flexDirection="row" gap={1} paddingTop={1}>
        <text fg={colors.label}>Current</text>
        <text fg={colors.tokens}>
          {formatCompactNumber(totalTokens(currentHour()?.tokens ?? zeroTokens()))}/hr
        </text>
        <text fg={colors.label}>Peak</text>
        <text fg={colors.tokens}>
          {formatCompactNumber(totalTokens(peakHour()?.tokens ?? zeroTokens()))}/hr
        </text>
      </box>
    </box>
  );
}
