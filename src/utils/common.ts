// utils/common.ts

import { Shift, ShiftTimingsInfo } from "Models/Shift";
import dayjs, { Dayjs } from "dayjs";

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

export const shifts: any = [
  { value: 'DS', label: 'Day Shift', startTime: "06:00:00", endTime: "17:59:59" },
  { value: 'NS', label: 'Night Shift', startTime: "18:00:00", endTime: "05:59:59" }
];

export const shiftDuration = (shifts, shift) => {

  let currentShiftData = shifts.filter(shiftData => { return shiftData.value === shift });
  if (currentShiftData && currentShiftData[0]) {
    currentShiftData = currentShiftData[0];
    const shiftDurationData = calculateHours(currentShiftData.startTime, currentShiftData.endTime)
    return shiftDurationData.hours
  };
  return 12;
}

export const crews: any = [
  { value: 'crewa', label: 'Crew A' },
  { value: 'crewb', label: 'Crew B' },
  { value: 'crewc', label: 'Crew C' }
];

export const shiftTimings = (date: Dayjs = dayjs()) => {
  let currentTime = typeof date === 'string' ? dayjs(date) : date;
  let previousDay = dayjs().subtract(1, 'day');
  let shifTimings;
  for (let i = 0; i < shifts.length; i++) {
    let shift = shifts[i];
    let startTime = shift.startTime.split(":");
    let start = dayjs().set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));
    let startPrev = previousDay.set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));

    let endTime = shift.endTime.split(":");
    let end = dayjs().add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));
    let endPrev = previousDay.add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));

    if ((currentTime.isSame(start) || currentTime.isAfter(start)) && (currentTime.isBefore(end) || currentTime.isSame(end))) {
      shifTimings = { start, end, shift: shift.value, shiftDate: start.format('YYYY-MM-DD') };
      break;
    }
    if ((currentTime.isSame(startPrev) || currentTime.isAfter(startPrev)) && (currentTime.isBefore(endPrev) || currentTime.isSame(endPrev))) {
      shifTimings = { start: startPrev, end: endPrev, shift: shift.value, shiftDate: startPrev.format('YYYY-MM-DD') };
      break;
    }
  }

  return shifTimings;
}

export const shiftTimingsByDateandShift = (shiftDate: string, shift: string): ShiftTimingsInfo => {
  let shiftInfo: Shift = shifts.find((s: Shift) => s.value === shift);

  let startTime: string[] = shiftInfo.startTime.split(":");
  let start: Dayjs = dayjs(shiftDate).set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1])).set('second', parseInt(startTime[2]));

  let endTime = shiftInfo.endTime.split(":");
  let end: Dayjs = dayjs(shiftDate).add(shiftInfo.startTime > shiftInfo.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1])).set('second', parseInt(endTime[2]));

  return { start: start, end: end, shift: shift, shiftDate: shiftDate };
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
