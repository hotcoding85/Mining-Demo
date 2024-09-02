import { configuration } from "./config";

interface Shift {
  startTime: string;
  duration: number;
  name: string;
}

// Utility function to format a Date object to HH:mm:ss
export const formatTime = (date: Date): string =>
  date.toTimeString().slice(0, 8);

// Function to calculate and format shift times
export const getShiftTimes = (dateShift: string) => {
  const [dateStr, shiftName] = dateShift.split(":");
  const shift = configuration.shifts.find((s: Shift) => s.name === shiftName);
  if (!shift) throw new Error(`Shift ${shiftName} not found in configuration.`);

  const [year, month, day] = dateStr.split("-").map(Number);
  const [startHour, startMinute] = shift.startTime.split(":").map(Number);

  const startTime = new Date(year, month - 1, day, startHour, startMinute);
  const endTime = new Date(startTime.getTime() + shift.duration * 60 * 1000);

  return {
    startTime: formatTime(startTime),
    startDateTime: startTime,
    endTime: formatTime(endTime),
    endDateTime: endTime,
  };
};
