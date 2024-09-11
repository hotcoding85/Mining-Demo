export const UserRoleOptions = [
  { key: 1, value: 'ADMIN', label: 'Administrator' },
  { key: 2, value: 'DISPATCHER', label: 'Dispatcher' },
  { key: 3, value: 'OPERATOR', label: 'Operator' }
]

export const UserSkillOptions = [
  { key: 1, value: 'HD785', label: 'HD785' },
  { key: 2, value: 'HD1500', label: 'HD1500' },
  { key: 3, value: 'PC1250', label: 'PC1250' },
  { key: 4, value: 'PC2000', label: 'PC2000' },
  { key: 5, value: 'GRADER', label: 'GRADER' },
  { key: 6, value: 'DRILLER', label: 'DRILLER' },
]

export const StatusOptions = [
  { key: 1, value: "ACTIVE", label: "Active" },
  { key: 2, value: "INACTIVE", label: "In Active" },
  { key: 3, value: "ARCHIVE", label: "Archive" },
];

export const StateOptions = [
  { key: 1, value: "ACTIVE", label: "ACTIVE" },
  { key: 2, value: "STANDBY", label: "STANDBY" },
  { key: 3, value: "DELAY", label: "DELAY" },
  { key: 4, value: "DOWN", label: "DOWN" },
];

export const VehicleMakes = [
  { key: 1, value: "KOMATSU", label: "KOMATSU" },
  { key: 2, value: "CATERPILLAR", label: "CATERPILLAR" },
  { key: 3, value: "SANDVIK", label: "SANDVIK" },
  { key: 4, value: "EPIROC", label: "EPIROC" },
]

export const VehicleModels = [{ key: 1, value: 'HD785', label: 'HD785' }, { key: 1, value: 'HD1500-7', label: 'HD1500-7' }, { key: 1, value: 'HD1500-8', label: 'HD1500-8' }, { key: 1, value: 'PC1250', label: 'PC1250' }, { key: 1, value: 'PC2000', label: 'PC2000' }, { key: 1, value: 'WA600', label: 'WA600' }, { value: 'D375A_8', label: 'D375A_8' }, { value: 'SmartROC_T45', label: 'SmartROC_T45' }]

export const VehicleCategories = [
  { key: 1, value: "DUMP_TRUCK", label: "DUMP TRUCK" },
  { key: 2, value: "EXCAVATOR", label: "EXCAVATOR" },
  { key: 3, value: "LOADER", label: "LOADER" },
  { key: 4, value: "DRILLER", label: "DRILLER" },
  { key: 5, value: "DOZER", label: "DOZER" },
  { key: 6, value: "WATER CART", label: "WATER CART" },
  { key: 7, value: "SERVICE VEHICLE", label: "SERVICE VEHICLE" },
  { key: 8, value: "LV", label: "LV" }
]

export const BenchCategories = [
  { key: 1, value: "SOURCE", label: "Source" },
  { key: 2, value: "DESTINATION", label: "Destination" },
]

export const MaterialCategories = [
  { key: 1, value: 'ORE', label: 'Ore' },
  { key: 2, value: 'WASTE', label: 'Waste' }
]