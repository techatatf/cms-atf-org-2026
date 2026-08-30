const publishedDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

export function formatPublishedDate(value: string) {
  return publishedDateFormatter.format(new Date(value));
}
