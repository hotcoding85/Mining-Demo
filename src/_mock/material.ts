import { uniq } from "lodash";

const materialCategories = ["ORE", "WASTE"];

export const getRandomNumberBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const generateMaterialMockData = (resource) => {
  const { materials, locations } = resource;

  const materialNames = materials.map((material) => material.name);

  let newMaterials: any = [];

  const blockIds = uniq(locations.map((location) => location.blockId));

  blockIds.forEach((blockId) => {
    if (!materialNames.includes(blockId)) {
      newMaterials.push({
        name: blockId,
        category: materialCategories[Math.floor(Math.random() * 2)],
        density: 1,
        grade: getRandomNumberBetween(0.7, 1).toFixed(2),
        status: "ACTIVE",
      });
    }
  });

  return newMaterials;
};
