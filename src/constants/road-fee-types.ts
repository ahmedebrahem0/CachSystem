export type RoadFeeType = "middle" | "regional" | "dahshur" | "desert" | "custom"

export interface RoadFeeTypeDefinition {
  key: RoadFeeType
  label: string
}

export const roadFeeTypes: RoadFeeTypeDefinition[] = [
  { key: "middle", label: "كارته الاوسطي" },
  { key: "regional", label: "كارته الاقليمي" },
  { key: "dahshur", label: "كارته دهشور" },
  { key: "desert", label: "كارته الصحراوي" },
  { key: "custom", label: "كارته أخرى" },
]

export const roadFeeTypeMap = Object.fromEntries(
  roadFeeTypes.map((type) => [type.key, type])
) as Record<RoadFeeType, RoadFeeTypeDefinition>

export function getRoadFeeLabel(roadFeeType?: RoadFeeType, customName?: string) {
  if (!roadFeeType) return undefined
  if (roadFeeType === "custom") return customName?.trim() || roadFeeTypeMap.custom.label
  return roadFeeTypeMap[roadFeeType].label
}
