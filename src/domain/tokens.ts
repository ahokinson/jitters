import type { TokenCount } from "@/domain/types.ts";
import { formatCompactNumber } from "@/util/format.ts";

export function zeroTokens(): TokenCount {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

export function addTokens(left: TokenCount, right: TokenCount): TokenCount {
  return {
    input: left.input + right.input,
    output: left.output + right.output,
    cacheRead: left.cacheRead + right.cacheRead,
    cacheWrite: left.cacheWrite + right.cacheWrite,
  };
}

export function totalTokens(count: TokenCount): number {
  return count.input + count.output + count.cacheRead + count.cacheWrite;
}

export function formatTokens(count: TokenCount): string {
  return formatCompactNumber(totalTokens(count));
}

export function formatTokenBreakdown(count: TokenCount): string {
  const parts = [
    `input:${formatCompactNumber(count.input)}`,
    `output:${formatCompactNumber(count.output)}`,
  ];
  if (count.cacheRead > 0) parts.push(`cache-read:${formatCompactNumber(count.cacheRead)}`);
  if (count.cacheWrite > 0) parts.push(`cache-write:${formatCompactNumber(count.cacheWrite)}`);
  return parts.join(" ");
}
