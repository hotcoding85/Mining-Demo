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
  targetGold: number,
  materials: Material[]
): DailyBlend[] {
  const blendPlan: DailyBlend[] = [];
  let dayCounter = 0;
  targetGold = targetGold * 1000;
  // Create a copy of the materials to avoid modifying the original reference
  const materialsData = materials.filter(material => material.tonnes !== undefined ).map((material) => ({ ...material }));

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
    // set delta value, need to adjust for this value
    let delta = 0;
    let totalGoldForToday = targetGold - delta;
    let index = 0;
    for (let material of materialsData) {
      if (material.tonnes > 0 && totalTonnesForToday < targetTonnes) {
        // Calculate how many tonnes to use from this material
        const tonnesToUse = Math.min(
          material.tonnes,
          targetTonnes - totalTonnesForToday,
          totalGoldForToday / material.grade
        );

        if (tonnesToUse === 0) {
          continue
        }
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
        totalGoldForToday -= goldRecovered;
        // Stop if we reached the target tonnes
        if (totalTonnesForToday >= targetTonnes) {
          break;
        }

        index++;
      }
    }

    // Handle the gap in tonnes with the lowest-grade material
    if (totalTonnesForToday < targetTonnes) {
      let t = targetTonnes - totalTonnesForToday;
      let lowestMaterial = materialsData[materialsData.length - 1]; // Get the lowest-grade material
      const tonnesToUse = Math.min(lowestMaterial.tonnes, t);
      const goldRecovered = tonnesToUse * lowestMaterial.grade;

      // Add the lowest-grade material to fill the gap in tonnes
      dailyBlend.materialsUsed[`M${index}`] = {
        tonnes: tonnesToUse,
        gold: goldRecovered,
        name: lowestMaterial.name,
        grade: lowestMaterial.grade,
      };

      dailyBlend.totalTonnesUsed += tonnesToUse;
      dailyBlend.totalGoldRecovered += goldRecovered;
      lowestMaterial.tonnes -= tonnesToUse;
      totalTonnesForToday += tonnesToUse;
      index ++
    }

    // Adjusting for the case when the total tonnes used is less than the target tonnes
    if (totalTonnesForToday < targetTonnes) {
      let remainingTonnes = targetTonnes - totalTonnesForToday;
      let remainingGold = targetGold - dailyBlend.totalGoldRecovered;

      for (let idx = materialsData.length - 1; idx >= 0; idx--) {
        const material = materialsData[idx];
        let tonnesToUse = Math.min(material.tonnes, remainingTonnes);
        let goldRecovered = tonnesToUse * material.grade;

        // Check if adding the lowest-grade material exceeds the target gold
        if (dailyBlend.totalGoldRecovered + goldRecovered > targetGold) {
          tonnesToUse = remainingGold / material.grade; // Adjust tonnes to meet gold target
          goldRecovered = tonnesToUse * material.grade;
        }

        if (material.tonnes > 0 && remainingTonnes > 0 && tonnesToUse > 0) {
          dailyBlend.materialsUsed[`M${index}`] = {
            tonnes: tonnesToUse,
            gold: goldRecovered,
            name: material.name,
            grade: material.grade,
          };

          dailyBlend.totalTonnesUsed += tonnesToUse;
          dailyBlend.totalGoldRecovered += goldRecovered;

          material.tonnes -= tonnesToUse;
          remainingTonnes -= tonnesToUse;
          remainingGold -= goldRecovered;

          index++;

          if (remainingTonnes === 0 || remainingGold <= 0) break;

        }
      }

      // If after this there is still a small tonnes gap, fill it with the lowest materials
      if (remainingTonnes > 0) {
        for (let idx = materialsData.length - 1; idx >= 0; idx--) {
          const material = materialsData[idx];
          const tonnesToUse = Math.min(material.tonnes, remainingTonnes);

          if (material.tonnes > 0 && remainingTonnes > 0) {
            const goldRecovered = tonnesToUse * material.grade;
            dailyBlend.materialsUsed[`M${index}`] = {
              tonnes: tonnesToUse,
              gold: goldRecovered,
              name: material.name,
              grade: material.grade,
            };

            dailyBlend.totalTonnesUsed += tonnesToUse;
            dailyBlend.totalGoldRecovered += goldRecovered;

            material.tonnes -= tonnesToUse;
            remainingTonnes -= tonnesToUse;

            index++;
            if (remainingTonnes === 0) break;
          }
        }
      }
    }

    // If no tonnes were used, break the loop
    if (dailyBlend.totalTonnesUsed === 0) {
      break;
    }
    console.log(blendPlan)
    // Add the daily blend to the blend plan
    blendPlan.push(dailyBlend);
  }
  return blendPlan;
}

export function generateBlendPlan2(
  targetTonnes: number,
  targetGold: number,
  materials: Material[]
): DailyBlend[] {

  const blendPlan: DailyBlend[] = [];
  let dayCounter = 1;
  
  const materialsData = materials.filter(material => material.tonnes !== undefined ).map((material) => ({ ...material }));

  // Get the sorted indices of gram_per_tone
  const sortedIndicesDesc = materialsData.sort((a, b) => b.grade - a.grade);

  // Sort both arrays using the sorted indices
  const sortedGramPerTone: number[] = sortedIndicesDesc.map(ind => ind.grade);
  const sortedMaterialAmount: number[] = sortedIndicesDesc.map(ind => ind.tonnes);

  // Display sorted arrays
  console.log("Sorted gram_per_tone:", sortedGramPerTone);
  console.log("Sorted material_amount:", sortedMaterialAmount);

  let previousList: number[] = [...sortedMaterialAmount];

  const amountPerDay: number = targetTonnes;
  const estimatedGold: number = targetGold * 1000;

  let totalGold: number = 0.0;
  let totalAmount: number = 0.0;

  for (let i = 0; i < sortedMaterialAmount.length; i++) {
      totalGold += sortedGramPerTone[i] * sortedMaterialAmount[i];
      totalAmount += sortedMaterialAmount[i];
  }

  const totalDates: number = Math.round(totalAmount / amountPerDay);
  let estimateDates: number = Math.floor(totalGold / estimatedGold);
  if (estimateDates > totalDates) {
      estimateDates = totalDates;
  }

  console.log("total_gold:", totalGold);
  console.log("total_amount:", totalAmount);
  console.log("total_dates:", totalDates);

  for (let i = 0; i < totalDates; i++) {
      let subGoldAmount: number = 0.0;
      let subMaterialAmount: number = 0.0;
      let index: number = 0;
      let dividedCount: number = estimateDates - i;

      if (dividedCount > 0) {
          for (let j = 0; j < materialsData.length; j++) {
              index = j;
              if (subMaterialAmount + sortedMaterialAmount[j] / dividedCount > amountPerDay) {
                  break;
              }
              subMaterialAmount += sortedMaterialAmount[j] / dividedCount;
              subGoldAmount += sortedGramPerTone[j] * sortedMaterialAmount[j] / dividedCount;
              sortedMaterialAmount[j] -= sortedMaterialAmount[j] / dividedCount;
          }
      }

      for (let k = index; k < materialsData.length; k++) {
          let estimatedMaterialAmount: number = subMaterialAmount + sortedMaterialAmount[k];
          if (estimatedMaterialAmount > 1000) {
              sortedMaterialAmount[k] -= (1000 - subMaterialAmount);
              subGoldAmount += sortedGramPerTone[k] * (1000 - subMaterialAmount);
              break;
          } else {
              subGoldAmount += sortedGramPerTone[k] * sortedMaterialAmount[k];
              subMaterialAmount += sortedMaterialAmount[k];
              sortedMaterialAmount[k] = 0.0;
          }
      }

      console.log("----------");
      console.log("sub_gold_amount:", subGoldAmount.toFixed(2));

      let result: any = []
      let dailyBlend: DailyBlend = {
        day: getDateFromToday(dayCounter),
        totalTonnesUsed: 0,
        totalGoldRecovered: 0,
        materialsUsed: {},
      };
      let totalTonnesUsed = 0
      let totalGoldRecovered = 0
      index = 0;
      for (let j = 0; j < materialsData.length; j++) {
          const gramPerToneValue = sortedGramPerTone[j];
          const difference = previousList[j] - sortedMaterialAmount[j];
          if (Number(difference) !== 0) {
            totalTonnesUsed += difference
            totalGoldRecovered += difference * gramPerToneValue
            dailyBlend.materialsUsed[`M${index}`] = {
              tonnes: difference,
              gold: difference * gramPerToneValue, 
              name: sortedIndicesDesc[j].name,
              grade: sortedIndicesDesc[j].grade,
            };
  
            index ++
          }
      }
      dailyBlend.totalTonnesUsed = totalTonnesUsed
      dailyBlend.totalGoldRecovered = totalGoldRecovered
      blendPlan.push(dailyBlend)
      dayCounter ++
      previousList = [...sortedMaterialAmount];
  }

  return blendPlan;
}

function getDateFromToday(dayCount: number): string {
  const today = new Date();
  today.setDate(today.getDate() + dayCount); // Add the day count to today
  return today.toLocaleDateString(); // Format the date as needed
}
