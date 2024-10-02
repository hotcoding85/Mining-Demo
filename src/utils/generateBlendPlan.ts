import { Material } from "slices/materials/reducer";

interface DailyBlend {
  day: string;
  totalTonnesUsed: number;
  totalGoldRecovered: number;
  materialsUsed: {
    [key: string]: {
      name: string;
      tonnes: number;
      gold: number;
      grade: number;
    };
  };
}

export function generateBlendPlan(
  targetTonnes: number,
  materials: Material[]
): DailyBlend[] {
  const blendPlan: DailyBlend[] = [];
  let dayCounter = 0;

  // Create a copy of the materials to avoid modifying the original reference
  const materialsData = materials.map((material) => ({ ...material }));

  // Sort materials by grade (highest first) to maximize gold recovery
  materialsData.sort((a, b) => b.grade - a.grade);

  // Iterate until all materials are processed
  while (materialsData.some((material) => material.tonnes > 0)) {
    dayCounter++;
    let dailyBlend: DailyBlend = {
      day: getDateFromToday(dayCounter),
      totalTonnesUsed: 0,
      totalGoldRecovered: 0,
      materialsUsed: {},
    };

    let totalTonnesForToday = 0;
    let index = 0;
    for (let material of materialsData) {
      if (material.tonnes > 0 && totalTonnesForToday < targetTonnes) {
        // Calculate how many tonnes to use from this material
        const tonnesToUse = Math.min(
          material.tonnes,
          targetTonnes - totalTonnesForToday
        );

        // Calculate gold recovered from this material
        const goldRecovered = tonnesToUse * material.grade;

        // Update blend details
        dailyBlend.materialsUsed[`M${index}`] = {
          tonnes: tonnesToUse,
          gold: goldRecovered,
          name: material.name,
          grade: material.grade,
        };

        // Update totals
        dailyBlend.totalTonnesUsed += tonnesToUse;
        dailyBlend.totalGoldRecovered += goldRecovered;

        // Deplete the material by creating a new object with updated tonnes
        material.tonnes -= tonnesToUse;
        totalTonnesForToday += tonnesToUse;

        // Stop if we reached the target tonnes
        if (totalTonnesForToday >= targetTonnes) {
          break;
        }

        index++;
      }
    }

    // If no tonnes were used, break the loop
    if (dailyBlend.totalTonnesUsed === 0) {
      break;
    }

    // Add the daily blend to the blend plan
    blendPlan.push(dailyBlend);
  }

  return blendPlan;
}

function getDateFromToday(dayCount: number): string {
    const today = new Date();
    today.setDate(today.getDate() + dayCount); // Add the day count to today
    return today.toLocaleDateString(); // Format the date as needed
}