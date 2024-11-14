export const data: any = [
  [
    {
      id: "1a",
      model: "HD785",
      equipmentName: "DT101",
      loadsCompleted: "11",
      trips: "Trip1",
      materialType: "Waste",
      actual: "902",
      planned: "2975",
      tonnesIndicated: "10",
      avgLoadCarriedBack: "10",
      actualTonnes: "10",
    },
    {
      id: "1a",
      model: "HD785",
      equipmentName: "DT102",
      loadsCompleted: "8",
      trips: "Trip2",
      materialType: "HG01",
      actual: "10",
      planned: "10",
      tonnesIndicated: "10",
      avgLoadCarriedBack: "10",
      actualTonnes: "10",
    },
  ],
  [
    {
      id: "1b",
      model: "HD1500",
      equipmentName: "DT121",
      loadsCompleted: "10",
      trips: "Trip1",
      materialType: "LG02",
      actual: "20",
      planned: "20",
      tonnesIndicated: "20",
      avgLoadCarriedBack: "20",
      actualTonnes: "20",
    },
    {
      id: "1b",
      model: "HD1500",
      equipmentName: "DT122",
      loadsCompleted: "9",
      trips: "Trip2",
      materialType: "HG01",
      actual: "20",
      planned: "20",
      tonnesIndicated: "20",
      avgLoadCarriedBack: "20",
      actualTonnes: "20",
    },
  ],
];

function generateRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function updateDataWithRandomValues(data: any[]): any[] {
  return data.map((dataGroup: any[]) => {
    return dataGroup.map((entry) => {
      const range = entry.model === "HD785" ? [60, 80] : entry.model === "HD1500" ? [90, 120] : [0, 0];

      return {
        ...entry,
        actual: generateRandomValue(500, 1500).toString(),
        planned: generateRandomValue(1500, 2500).toString(),
        tonnesIndicated: generateRandomValue(range[0], range[1]).toString(),
        avgLoadCarriedBack: generateRandomValue(range[0], range[1]).toString(),
        actualTonnes: generateRandomValue(500, 1500).toString(),
      };
    });
  });
}