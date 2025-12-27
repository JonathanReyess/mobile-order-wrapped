// src/utils/dateUtils.ts

export interface FormattedDate {
  month: string;
  day: string;
}

export function formatToMonthDay(dateStr: string): FormattedDate | string {
  if (!dateStr) return "Invalid date";

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) return "Invalid date";

  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const dayNum = date.toLocaleDateString("en-US", { day: "numeric" });

  return { month: monthName, day: dayNum };
}
