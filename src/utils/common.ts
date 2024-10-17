// utils/common.ts

import { Shift, ShiftTimingsInfo } from "Models/Shift";
import dayjs, { Dayjs } from "dayjs";
import _, { round } from "lodash";

export const dateFormats: any = {
  FULL_DATE: 'YYYY-MM-DDTHH:mm:ss.000Z'
}

export const getEpoch = (date) => {
  let unixDate = dayjs(date).unix();
  return unixDate
}

export const getDateInFormat = (timestamp, format) => {
  let date = dayjs.unix(timestamp).format(format)
  return date
}

export const shifts: any = JSON.parse(localStorage.getItem('shifts')!);

export const shiftsInFormat: any = (shifts) => {

  let currentShifts = shifts;
  if (!shifts) {
    currentShifts = JSON.parse(localStorage.getItem('shifts')!);
  }

  return currentShifts.map((shift) => { return { value: shift.name, label: shift.name } })
}

export const shiftDuration = (shifts, shift) => {

  let currentShifts = shifts;
  if (!shifts) {
    currentShifts = JSON.parse(localStorage.getItem('shifts')!);
  }

  let currentShiftData = currentShifts.filter(shiftData => { return shiftData.name === shift });
  if (currentShiftData && currentShiftData[0]) {
    currentShiftData = currentShiftData[0];
    const shiftDurationData = currentShiftData.duration / 60;
    return shiftDurationData;
  };
  return 12;
}

export const shiftTimings = (date: Dayjs = dayjs()) => {
  let currentTime = typeof date === 'string' ? dayjs(date) : date;
  let previousDay = dayjs().subtract(1, 'day');
  let shifTimings;
  let currentShifts = shifts;

  if (!shifts) {
    currentShifts = JSON.parse(localStorage.getItem('shifts')!);
  }

  for (let i = 0; i < currentShifts.length; i++) {
    let shift = currentShifts[i];
    let startTime = shift.startTime.split(":");
    let start = dayjs().set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));
    let startPrev = previousDay.set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));

    const endDateTime = calculateEndTime(shift.startTime, shift.duration);
    shift.endTime = endDateTime;
    let endTime = shift.endTime.split(":");
    let end = dayjs().add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));
    let endPrev = previousDay.add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));

    if ((currentTime.isSame(start) || currentTime.isAfter(start)) && (currentTime.isBefore(end) || currentTime.isSame(end))) {
      shifTimings = { start, end, shift: shift.name, shiftDate: start.format('YYYY-MM-DD') };
      break;
    }
    if ((currentTime.isSame(startPrev) || currentTime.isAfter(startPrev)) && (currentTime.isBefore(endPrev) || currentTime.isSame(endPrev))) {
      shifTimings = { start: startPrev, end: endPrev, shift: shift.name, shiftDate: startPrev.format('YYYY-MM-DD') };
      break;
    }
  }

  return shifTimings;
}

export const shiftTimingsByDateandShift = (shiftDate: string, shift: string): ShiftTimingsInfo => {
  let currentShifts = shifts;
  if (!shifts) {
    currentShifts = JSON.parse(localStorage.getItem('shifts')!);
  }

  let shiftInfo: Shift = currentShifts.find((s: Shift) => s['name'] === shift);

  let startTime: string[] = shiftInfo.startTime.split(":");
  let start: Dayjs = dayjs(shiftDate).set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1])).set('second', parseInt(startTime[2]));

  const endDateTime = calculateEndTime(shiftInfo.startTime, shiftInfo.duration);
  shiftInfo.endTime = endDateTime;
  let endTime = shiftInfo.endTime.split(":");
  let end: Dayjs = dayjs(shiftDate).add(shiftInfo.startTime > shiftInfo.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1])).set('second', parseInt(endTime[2]));

  return { start: start, end: end, shift: shift, shiftDate: shiftDate };
}

export const minsToTime = (duration: number, isFormat: boolean = false) => {
  let hours = Math.floor((duration / 60) % 24);
  let minutes = Math.floor(duration % 60);
  let seconds = Math.floor((duration / (60 * 60)) % 60);

  if (isFormat) {
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
  }

  return {
    hours,
    minutes,
    seconds
  }
}

export const msToTime = (duration: number, isFormat: boolean = false) => {
  let hours = Math.floor((duration / (60 * 60)) % 24);
  let minutes = Math.floor((duration / (60)) % 60);

  if (isFormat) {
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`
  }

  return {
    hours,
    minutes
  }
}

export const getContentByState = (state) => {

  let color = "#008000";
  let displayState = "Standby";
  switch (state) {
    case "ACTIVE":
      color = "#008000";
      displayState = 'Active';
      break;
    case "DELAY":
      color = "#6A32C9";
      displayState = 'Delayed';
      break;
    case "STANDBY":
      color = "#FFBF00";
      displayState = 'Standby';
      break;
    case "DOWN":
      color = "#F00";
      displayState = 'Down';
      break;
    default:
      break;
  }
  return { color, displayState };
}

export const formatNumber = (value: number): string => {
  let formatter = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  let formattedNumber: string = formatter.format(value);
  return formattedNumber
}

export const roundOff = (value: number): number => {
  let formatter = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  let formattedNumber: string = formatter.format(value);
  return parseFloat(formattedNumber)
}

export const round2One = (value: number): number => {
  let formatter = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  let formattedNumber: string = formatter.format(value);
  return parseFloat(formattedNumber)
}

export const round2Two = (value: number): string => {
  if (!value) return ""
  let formatter = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let formattedNumber: string = formatter.format(value);
  return formattedNumber
}
const calculateEndTime = (startTime, duration) => {

  // Create Date objects for the start and end times
  const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
  const shiftDuration: any = minsToTime(duration, true);
  const [durationHours, durationMinutes, durationSeconds] = shiftDuration.split(':').map(Number);
  const hours = durationHours + startHours;
  const minutes = durationMinutes + startMinutes;
  const seconds = durationSeconds + startSeconds;

  const endDateTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

  return endDateTime;
}

const calculateHours = (startTime, endTime) => {
  // Define a date object to use today's date
  const today = new Date();

  // Create Date objects for the start and end times
  const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
  const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);

  // Set the time for the start and end time on today's date
  const startDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHours, startMinutes, startSeconds);
  const endDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHours, endMinutes + 1, endSeconds);

  // Calculate the difference in milliseconds
  const differenceMs: number = endDateTime.getTime() - startDateTime.getTime();

  // Convert milliseconds to hours, minutes, and seconds
  const totalSeconds = Math.floor(differenceMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
}

export const saveFile = (blob: Blob, fileName: string): void => {
  const htmlElement = document.createElement('a');
  htmlElement.download = fileName;
  htmlElement.href = URL.createObjectURL(blob);
  htmlElement.addEventListener('click', (e) => {
    setTimeout(() => {
      URL.revokeObjectURL(htmlElement.href);

    }, 30 * 1000);
  });
  htmlElement.click();
}


export const getTarget = (vehicleType, capacity, targetType, date, shift) => {

  const targetsConfig = {
    SHIFT: {
      availablePer: 80,
      standbyPer: 10
    },
    DAILY: {
      availablePer: 80,
      standbyPer: 10
    },
    WEEKLY: {
      availablePer: 80,
      standbyPer: 10
    },
    MONTHLY: {
      availablePer: 80,
      standbyPer: 10
    }
  }

  var target = _.cloneDeep(targetsConfig[targetType]);

  if (targetType === 'SHIFT') {
    let currentShifts = shifts;
    if (!shifts) {
      currentShifts = JSON.parse(localStorage.getItem('shifts')!);
    }
    const duration = shiftDuration(currentShifts, shift);
    target.availability = roundOff((target['availablePer'] * duration) * 60 / 100);
    target.standby = roundOff((target['standbyPer'] * target.availability) / 100);
  } else if (targetType === 'DAILY') {
    target.availability = _.round((target['availablePer'] * 24 * 60) / 100, 2);
    target.standby = roundOff((target['standbyPer'] * target.availability) / 100);
  } else if (targetType === 'WEEKLY') {
    target.availability = roundOff((target['availablePer'] * (7 * 24 * 60)) / 100);
    target.standby = roundOff((target['standbyPer'] * target.availability) / 100);
  } else if (targetType === 'MONTHLY') {
    const daysInMonth = dayjs(date).daysInMonth();
    target.availability = roundOff((target['availablePer'] * daysInMonth * 24 * 60) / 100);
    target.standby = roundOff((target['standbyPer'] * target.availability) / 100);
  }

  target.utilization = roundOff(target.availability - target.standby);
  target.utilizationPer = roundOff((target.utilization / target.availability) * 100);
  target.avgLoad = capacity;
  target.avgTime = vehicleType === 'DUMP_TRUCK' ? 15 : 3;

  target.loads = roundOff((target.utilization / target.avgTime));
  target.tonnes = _.round(target.loads * target.avgLoad, 2);

  return target;
}

export const minutesToHhMm = (minutes: number): string => {
  // Calculate hours and remaining minutes
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Format hours and minutes to always be two digits
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(mins).padStart(2, '0');

  // Return the formatted string
  return `${formattedHours}:${formattedMinutes}`;
}

export const secondsToHMS = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const divide12HoursRandomlyFormatted = (numParts: number): string[] => {
  const totalMinutes = 12 * 60; // 12 hours in minutes

  // Generate random parts
  const parts: number[] = [];
  let remainingMinutes = totalMinutes;

  // Generate (numParts - 1) random cuts
  for (let i = 0; i < numParts - 1; i++) {
    // Random value between 1 and remainingMinutes - (numParts - i - 1)
    const max = remainingMinutes - (numParts - i - 1);
    const part = Math.floor(Math.random() * (max - 1)) + 1;
    parts.push(part);
    remainingMinutes -= part;
  }

  // The last part takes the remaining minutes
  parts.push(remainingMinutes);

  // Shuffle the parts array to ensure randomness
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]]; // Swap elements
  }

  // Sort the parts in descending order
  parts.sort((a, b) => b - a);

  // Convert each part to hh:mm format
  const formattedParts = parts.map(minutesToHhMm);

  return formattedParts;
}

export const divide12HoursRandomly = (numParts: number): number[] => {
  const totalMinutes = 12 * 60; // 12 hours in minutes

  // Generate random parts
  const parts: number[] = [];
  let remainingMinutes = totalMinutes;

  // Generate (numParts - 1) random cuts
  for (let i = 0; i < numParts - 1; i++) {
    // Random value between 1 and remainingMinutes - (numParts - i - 1)
    const max = remainingMinutes - (numParts - i - 1);
    const part = Math.floor(Math.random() * (max - 1)) + 1;
    parts.push(part);
    remainingMinutes -= part;
  }

  // The last part takes the remaining minutes
  parts.push(remainingMinutes);

  // Shuffle the parts array to ensure randomness
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]]; // Swap elements
  }

  // Sort the parts in descending order
  parts.sort((a, b) => b - a);

  return parts;
}