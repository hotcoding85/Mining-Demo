import { format, addMinutes, startOfDay, endOfDay, getUnixTime } from 'date-fns';
import { format as formatInTimeZone } from 'date-fns-tz';

const sequence = [
    "TRAVELLING", "QUEUING", "SPOTTING", "LOADING", "HAULING",
    "REVERSING", "DUMPING"
];
const numRepeats = 10; // Number of repeats for each sequence
const minDuration = 2; // minutes
const maxDuration = 15; // minutes
const timezone = 'Asia/Singapore'; // UTC+8

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateTasks(group: number): any[] {
    const tasks: any[] = [];
    let current = startOfDay(new Date()); // Start at 6:00 AM
    const now = new Date();
    let taskId = group*1000;

    while (current < now) {
        // Add STANDBY period
        const standbyDuration = getRandomInt(minDuration, maxDuration);
        let endTime = addMinutes(current, standbyDuration);

        if (endTime > now) endTime = now;

        tasks.push({
            id: taskId++,
            start: formatInTimeZone(current, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
            end: formatInTimeZone(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
            content: 'STANDBY',
            style: 'color: white; background-color: orange;',
            group: group
        });

        current = endTime;

        // Generate trips
        for (let i = 0; i < numRepeats; i++) {
            
            for (const content of sequence) {
                let bgColor = 'green'
                const duration = getRandomInt(minDuration, maxDuration);
                endTime = addMinutes(current, duration);

                if (endTime > now) endTime = now;

                if (content == 'QUEUING') {
                    bgColor = 'purple'
                }

                tasks.push({
                    id: taskId++,
                    start: formatInTimeZone(current, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
                    end: formatInTimeZone(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
                    'style': 'color: white; background-color: '+bgColor+';',
                    content,
                    group: group
                });

                if(content == 'DUMPING') {
                    current = endTime;
                    const duration = getRandomInt(minDuration, maxDuration);
                    endTime = addMinutes(current, duration);
                    if (endTime > now) endTime = now;
                    tasks.push({
                        id: taskId++,
                        start: formatInTimeZone(current, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
                        end: formatInTimeZone(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
                        'style': 'color: white; background-color: grey;',
                        content: 'IDLING',
                        group: group
                    });
                }

                current = endTime;

                if (current >= now) break;
            }
            if (current >= now) break;
        }

        tasks.push({
            id: taskId++,
            start: formatInTimeZone(current, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
            end: formatInTimeZone(endTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone }),
            content: 'CRIB BREAK',
            style: 'color: white; background-color: orange;',
            group: group
        });
    }
    
    return tasks;
}
