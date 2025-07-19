export function transformPaginatedData(data: any) {
  const count = data[0]['0'].total;

  const rows = Object.values(data[1]).map((item: any) => item.details ?? item);

  return {
    count,
    rows
  };
}