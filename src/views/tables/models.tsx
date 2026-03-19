import { For } from "solid-js";
import { totalTokens } from "@/domain/tokens.ts";
import type { ModelBreakdown } from "@/domain/types.ts";
import { colors } from "@/util/colors.ts";
import { formatCompactNumber, padLeft, padRight, shortenModel } from "@/util/format.ts";

interface ModelTableProps {
  title: string;
  models: ModelBreakdown[];
  contentWidth: number;
}

function layout(contentWidth: number) {
  const wide = contentWidth >= 70;
  const columnWidth = wide ? 8 : 6;
  const dataCols = wide ? 5 : 3;
  const gaps = dataCols;
  const modelWidth = Math.max(contentWidth - dataCols * columnWidth - gaps, 8);
  return { columnWidth, modelWidth, wide };
}

export function ModelTable(props: ModelTableProps) {
  const columns = () => layout(props.contentWidth);

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      borderStyle="rounded"
      borderColor={colors.border}
      title={` ${props.title} `}
      titleAlignment="left"
      paddingX={1}
      paddingY={1}
    >
      <box flexDirection="row" gap={1}>
        <text fg={colors.dim}>{padRight("Model", columns().modelWidth)}</text>
        <text fg={colors.dim}>{padLeft("Input", columns().columnWidth)}</text>
        <text fg={colors.dim}>{padLeft("Output", columns().columnWidth)}</text>
        {columns().wide && <text fg={colors.dim}>{padLeft("Cache R", columns().columnWidth)}</text>}
        {columns().wide && <text fg={colors.dim}>{padLeft("Cache W", columns().columnWidth)}</text>}
        <text fg={colors.dim}>{padLeft("Total", columns().columnWidth)}</text>
      </box>
      <For each={props.models}>
        {(model) => (
          <box flexDirection="row" gap={1}>
            <text fg={colors.text}>
              {padRight(shortenModel(model.model), columns().modelWidth)}
            </text>
            <text fg={colors.tokens}>
              {padLeft(formatCompactNumber(model.tokens.input), columns().columnWidth)}
            </text>
            <text fg={colors.tokens}>
              {padLeft(formatCompactNumber(model.tokens.output), columns().columnWidth)}
            </text>
            {columns().wide && (
              <text fg={colors.tokens}>
                {padLeft(formatCompactNumber(model.tokens.cacheRead), columns().columnWidth)}
              </text>
            )}
            {columns().wide && (
              <text fg={colors.tokens}>
                {padLeft(formatCompactNumber(model.tokens.cacheWrite), columns().columnWidth)}
              </text>
            )}
            <text fg={colors.tokens}>
              {padLeft(formatCompactNumber(totalTokens(model.tokens)), columns().columnWidth)}
            </text>
          </box>
        )}
      </For>
    </box>
  );
}
