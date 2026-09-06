export const MATERIAL_CATEGORIES = [
  { value: "resident", label: "居民反馈" },
  { value: "official", label: "部门书面答复" },
  { value: "handling", label: "回访与办理记录" },
  { value: "rectification", label: "整改与现场复核" },
] as const;

export function isMaterialCategory(value: string) {
  return MATERIAL_CATEGORIES.some((category) => category.value === value);
}

export function materialCategoryLabel(value: string) {
  return MATERIAL_CATEGORIES.find((category) => category.value === value)?.label ?? "未分类";
}
