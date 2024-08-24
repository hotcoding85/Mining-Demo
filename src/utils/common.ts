// utils/common.ts

import dayjs from "dayjs";

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
  { value: 'DS', label: 'Day Shift', startTime: "06:00", endTime: "18:00" },
  { value: 'NS', label: 'Night Shift', startTime: "18:00", endTime: "06:00" }
];

export const crews: any = [
  { value: 'crewa', label: 'Crew A' },
  { value: 'crewb', label: 'Crew B' },
  { value: 'crewc', label: 'Crew C' }
];

export const shiftTimings = () => {
  let currentTime = dayjs();
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

