export interface ITarget {
  category: string;
  roster: string;
  data: IData;
  vehicleId: string;
}

export interface IData {
  tonnes: number;
  availability: number;
  utilization: number;
  standby: number;
  tph: number;
}

/**
 * Generates mock target data based on the provided resource and rosters.
 * @param resource The resource object containing vehicle information.
 * @param rosters Array of roster items, each containing a vehicleId and roster.
 * @returns Array of ITarget objects with populated data.
 */
export const generateMockTargetData = (
  resource: { vehicles: any[] },
  rosters: { vehicleId: string; roster: string }[]
): ITarget[] => {
  const { vehicles } = resource;

  // Normalize vehicles by their ID for quick access
  const normalizedVehicles: Record<string, any> = vehicles.reduce(
    (acc, vehicle) => {
      acc[vehicle.id] = vehicle;
      return acc;
    },
    {} as Record<string, any>
  );

  // Generate target data for each roster
  const targets: ITarget[] = rosters.map((item) => ({
    category: normalizedVehicles[item.vehicleId]?.category || "Unknown",
    vehicleId: item.vehicleId,
    roster: item.roster,
    data: generateRandomIData(),
  }));

  return targets;
};

/**
 * Generates random IData for a vehicle or equipment.
 * @returns An IData object with randomly generated values.
 */
function generateRandomIData(): IData {
  const availability = getRandomInRange(80, 100);
  const utilization = getRandomInRange(60, 95);
  const standby = 100 - utilization;
  const tph = getRandomInRange(50, 200);

  // Calculate total tonnes processed based on utilization and availability over 24 hours
  const operatingHours = (utilization / 100) * (availability / 100) * 24;
  const tonnes = tph * operatingHours;

  return {
    tonnes: roundToTwoDecimals(tonnes),
    availability: roundToTwoDecimals(availability),
    utilization: roundToTwoDecimals(utilization),
    standby: roundToTwoDecimals(standby),
    tph: roundToTwoDecimals(tph),
  };
}

/**
 * Generates a random number within a specified range.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns A random number between min and max.
 */
function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Rounds a number to two decimal places.
 * @param value The number to round.
 * @returns The number rounded to two decimal places.
 */
function roundToTwoDecimals(value: number): number {
  return parseFloat(value.toFixed(2));
}
