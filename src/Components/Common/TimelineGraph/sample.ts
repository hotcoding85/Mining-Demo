import { addMinutes, startOfDay, setHours } from 'date-fns';
import { format as formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { DataItem } from 'vis-timeline/standalone';


const timezone = 'Asia/Singapore'; 


function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateTasks(group: number): DataItem[] {
  const tasks: DataItem[] = [];


  let current = toZonedTime(new Date(), timezone);
  current.setHours(6, 0, 0, 0); 
  const now = toZonedTime(new Date(), timezone);



  let taskId = group * 1000;

  const createTask = (content: string, start: Date, end: Date, color: string): DataItem => ({
    id: taskId++,
    start: formatInTimeZone(start, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
    end: formatInTimeZone(end, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
    content,
    style: `color: white; background-color: ${color};`,
    group: group,
  });

  let tasksCount = 0;
  while (current < now && tasksCount < 100) { 
    
    const standbyDuration = getRandomInt(2, 15);


    let endTime = addMinutes(current, standbyDuration);
    if (endTime > now) endTime = now;

    tasks.push(createTask('STANDBY', current, endTime, 'orange'));
    tasksCount++;
    current = endTime;

    for (let i = 0; i < 10; i++) { 
      for (const content of ["TRAVELLING", "QUEUING", "SPOTTING", "LOADING", "HAULING", "REVERSING", "DUMPING"]) {
        const duration = getRandomInt(2, 15);
        

        endTime = addMinutes(current, duration);
        if (endTime > now) endTime = now;

        let bgColor = content === 'QUEUING' ? 'purple' : 'green';
        tasks.push(createTask(content, current, endTime, bgColor));
        tasksCount++;

        if (content === 'DUMPING') {
          current = endTime;
          const idlingDuration = getRandomInt(2, 15);
        

          endTime = addMinutes(current, idlingDuration);
          if (endTime > now) endTime = now;
          tasks.push(createTask('IDLING', current, endTime, 'grey'));
          tasksCount++;
        }

        current = endTime;
        if (current >= now) break;
      }
      if (current >= now) break;
    }

    tasks.push(createTask('CRIB BREAK', current, endTime, 'orange'));
    tasksCount++;
  }

  return tasks;
}
