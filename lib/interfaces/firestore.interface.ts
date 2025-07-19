export type DocumentDataProps = { id: string; data: () => Record<string, unknown> };
export type ChangeTypeProps = "added" | "modified" | "removed" | "all";
export type ConditionProps = {
  field: string, 
  operator: string,
  value: string
}