import dayjs from "dayjs";
import { configuration } from "./config";
import { groupBy } from "lodash";
import { getShiftTimes } from "./common";

// TypeScript Interfaces for better type safety and clarity
interface Resource {
  locations: Location[];
  materials: Material[];
  vehicles: Vehicle[];
  users: User[];
}

interface Target {
  roster: string;
  data: { tonnes: number };
  vehicleId: string;
}

interface Operator {
  id: string;
  role: string;
}

interface Location {
  id: string;
  blockId: string;
}

interface Material {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  name: string;
  category: string;
}

interface User {
  id: string;
  role: string;
}

// Utility function to normalize array of objects by a specified key
const normalizeById = <T extends Record<K, string>, K extends keyof T>(
  items: T[],
  key: K = "id" as K
) => {
  return items.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {} as Record<string, T>);
};

// Utility function to get a random element from an array
const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// Function to generate location and material for plans
const getLocationAndMaterial = (
  locations: Location[],
  materials: Record<string, Material>
) => {
  const source = getRandomElement(locations);
  const material = materials[source.blockId];
  const destination = getRandomElement(
    locations.filter((loc) => loc.id !== source.id)
  );

  return {
    sourceId: source.id,
    materialId: material?.id || "",
    destinationId: destination.id,
  };
};

// Main function to generate mock plan data
export const generateMockPlanData = (
  resource: Resource,
  targets: Target[],
  rosters: any[]
) => {
  const { locations, materials, vehicles, users } = resource;

  const normalizedVehicles = normalizeById(vehicles);
  const normalizedMaterials = normalizeById(materials, "name");
  const normalizeRosters = normalizeById(rosters, "roster");

  const admins = users.filter((user) => user.role === "ADMIN");

  const plans = targets.map((target) => {
    const { sourceId, materialId, destinationId } = getLocationAndMaterial(
      locations,
      normalizedMaterials
    );
    const { startDateTime, endDateTime } = getShiftTimes(target.roster);

    return {
      roster: target.roster,
      tonnes: target.data.tonnes,
      vehicleId: target.vehicleId,
      sourceId,
      materialId,
      destinationId,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      supporting: normalizeRosters[target.roster].trucks.map(
        (truck) => truck.id
      ),
    };
  });

  return plans;
};
