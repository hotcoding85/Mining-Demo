import dayjs from "dayjs";
import Users from "Pages/Users";

/**
 * Generate mock data based on backend resource
 * @param resource any
 * @param startDate Date
 * @param endDate Date
 * @returns Array of mock rosters
 */
export const generateMockRosterData = (
  resource: any,
  startDate: Date,
  endDate: Date,
  users
) => {
  const { vehicles } = resource;
  const mockRosterList: any[] = [];

  const diggers = vehicles.filter(
    (vehicle) => vehicle.category === "EXCAVATOR"
  );

  const trucks = vehicles.filter(
    (vehicle) => vehicle.category === "DUMP_TRUCK"
  );

  let lastShiftUsers: string[] = [];

  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const dayShiftRoster = dayjs(currentDate).format("YYYY-MM-DD") + ":DS";
    const nightShiftRoster = dayjs(currentDate).format("YYYY-MM-DD") + ":NS";

    const dayShiftUsers: string[] = generateShiftRoster(
      diggers,
      trucks,
      users,
      lastShiftUsers,
      dayShiftRoster,
      mockRosterList
    );

    lastShiftUsers = generateShiftRoster(
      diggers,
      trucks,
      users,
      dayShiftUsers,
      nightShiftRoster,
      mockRosterList
    );
  }

  return mockRosterList;
};

/**
 * Generate a roster for a specific shift
 * @param diggers Array of digger vehicles
 * @param users Array of users
 * @param lastShiftUsers Array of users from the last shift
 * @param rosterName Name of the roster (DS or NS)
 * @param rosterList List to store the generated roster
 * @returns Array of user IDs for the current shift
 */
const generateShiftRoster = (
  diggers: any[],
  trucks: any[],
  users: any[],
  lastShiftUsers: string[],
  rosterName: string,
  rosterList: any[]
): string[] => {
  const currentShiftUsers: string[] = [];

  diggers.forEach((digger, index) => {
    const operators = getRandomUsersExcept(users, [
      ...lastShiftUsers,
      ...currentShiftUsers,
    ]);

    if (operators.length === 5) {
      const currentOperators = operators.map((operator) => operator.id);
      currentShiftUsers.push(...currentOperators);
      rosterList.push({
        vehicleId: digger.id,
        operators: currentOperators,
        trucks: trucks.slice(index * 4, (index + 1) * 4),
        roster: rosterName,
      });
    } else {
      const operators = getRandomUsersExcept(users, []);
      rosterList.push({
        vehicleId: digger.id,
        operators: operators,
        trucks: trucks.slice(0, 4),
        roster: rosterName,
      });
    }
  });

  return currentShiftUsers;
};

/**
 * Get up to 5 random users except those in the exclude list
 * @param users Array of users
 * @param exclude Array of user IDs to exclude
 * @returns An array of up to 5 random users
 */
function getRandomUsersExcept(users: any[], exclude: string[]) {
  const availableUsers: any = users.filter(
    (user) => !exclude.includes(user.id)
  );
  const randomUsers: any[] = [];

  while (randomUsers.length < 5 && availableUsers.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    randomUsers.push(availableUsers[randomIndex]);
    availableUsers.splice(randomIndex, 1); // Remove the selected user from the pool
  }

  return randomUsers;
}
