export interface TimelineSlot {
  time: string;
  date: string;
  isNewDay: boolean;
}

export function calculateTimelineSlots(selectedDate: Date, shiftType: string, zoomSize: number): TimelineSlot[] {
  const timeline: TimelineSlot[] = [];
  let startTime: Date;
  let endTime: Date;

  switch (shiftType) {
    case 'DAY_SHIFT':
      startTime = new Date(selectedDate);
      startTime.setHours(6, 0, 0, 0);
      endTime = new Date(selectedDate);
      endTime.setHours(18, 0, 0, 0);
      break;
    case 'NIGHT_SHIFT':
      startTime = new Date(selectedDate);
      startTime.setHours(18, 0, 0, 0);
      endTime = new Date(selectedDate);
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(6, 0, 0, 0);
      break;
    case 'WORK_DAY':
      startTime = new Date(selectedDate);
      startTime.setHours(6, 0, 0, 0);
      endTime = new Date(selectedDate);
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(6, 0, 0, 0);
      break;
    case 'WORK_WEEK':
      startTime = new Date(selectedDate);
      startTime.setDate(startTime.getDate() - startTime.getDay() + 1); // Start from Monday
      startTime.setHours(6, 0, 0, 0);
      endTime = new Date(startTime);
      endTime.setDate(endTime.getDate() + 7);
      endTime.setHours(6, 0, 0, 0);
      break;
    default:
      return [];
  }

  let previousDate = '';

  while (startTime < endTime) {
    const formattedTime = startTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const formattedDate = startTime.toLocaleDateString([], {
      // weekday: 'short',
      year: '2-digit',
      month: 'short',
      day: 'numeric',
    });

    const isNewDay = formattedDate !== previousDate;
    previousDate = formattedDate;

    timeline.push({
      time: formattedTime,
      date: formattedDate,
      isNewDay: isNewDay,
    });

    startTime.setMinutes(startTime.getMinutes() + zoomSize);
  }

  return timeline;
};

// Format the date to YYYY-MM-DDTHH:MM for input[type="datetime-local"]
export const formatDateForInput = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().substring(0, 16);
};