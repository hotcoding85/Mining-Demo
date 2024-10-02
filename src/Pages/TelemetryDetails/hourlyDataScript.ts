
function generateHourlyData(name, payloadPattern) {
    let data: any = [];

    var payload = 2638;

    // Generate time slots for every minute from '00:00' to '59:00'
    for (let minute = 1200; minute < 1450; minute++) {
        const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

        // Choose a payload from the pattern or randomize if pattern is not provided
        // const payload = payloadPattern[Math.floor(Math.random() * payloadPattern.length)];

        data.push({
            hour: time,
            name: name,
            payload: payload++
        });
    }

    // writeFileSync('./data', JSON.stringify(data));

    // window.navigator.clipboard.writeText(JSON.stringify(data));
    return JSON.stringify(data);
}

// Usage example
const payloadPattern = [50.31, 60.31, 80.31]; // Example payload patterns
const hourlyData = generateHourlyData("EX201", payloadPattern);