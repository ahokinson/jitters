export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function formatCost(cost: number): string {
  if (cost === 0) return "$0";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

export function padRight(text: string, width: number): string {
  return text.length >= width ? text.slice(0, width) : text + " ".repeat(width - text.length);
}

export function padLeft(text: string, width: number): string {
  return text.length >= width ? text.slice(0, width) : " ".repeat(width - text.length) + text;
}

export function shortenModel(model: string): string {
  return model.replace(/^claude-/, "").replace(/-\d{8}$/, "");
}

const dateFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export function formatDate(dateKey: string): string {
  return dateFormatter.format(new Date(`${dateKey}T00:00`));
}

export function hourLabel(hourKey: string): string {
  const hour = Number.parseInt(hourKey.slice(11, 13), 10);
  const suffix = hour >= 12 ? "p" : "a";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}${suffix}`;
}
