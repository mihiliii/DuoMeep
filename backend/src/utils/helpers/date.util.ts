export function buildDateRangeFilter(dateFrom?: Date, dateTo?: Date): Record<string, Date> {
  const filter: Record<string, Date> = {};

  if (dateFrom) {
    const from: Date = new Date(dateFrom);
    from.setUTCHours(0, 0, 0, 0);
    filter.$gte = from;
  }

  if (dateTo) {
    const to: Date = new Date(dateTo);
    to.setUTCHours(0, 0, 0, 0);
    to.setUTCDate(to.getUTCDate() + 1);
    filter.$lt = to;
  }

  return filter;
}
