export function formatDisplayDate(date: string): string {
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (parsed.getFullYear() < new Date().getFullYear()) {
    options.year = "numeric";
  }

  return parsed.toLocaleDateString("en-US", options);
}
