/** The year in a date like "May 2023". */
export function yearOf(date: string) {
  return date.match(/\d{4}/)?.[0] ?? "";
}

/** The final year of a range like "May 2025 - Aug 2025"; "Now" for a current role. */
export function endYear(dates: string) {
  if (/present\s*$/i.test(dates)) return "Now";
  return dates.match(/(\d{4})\s*$/)?.[1] ?? "";
}
