export const trucks = [
  {
    index: '1',
    id: "DT101",
    model: "HD785",
    excavator: 'EX201',
    times: ["00:27", "00:15", "00:24", "00:22"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
  },
  {
    index: '2',
    id: "DT102",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX201',
  },
  {
    index: '3',
    id: "DT103",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22", '00:30'],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t", "9.8t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX201',
  },
  {
    index: '5',
    id: "DT101",
    model: "HD785",
    excavator: 'EX202',
    times: ["00:27", "00:15", "00:24"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
  },
  {
    index: '6',
    id: "DT102",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX202',
  },
  {
    index: '7',
    id: "DT103",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22", '00:30'],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t", "9.8t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX202',
  },
  {
    index: '8',
    id: "DT104",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX203',
  },
  {
    index: '9',
    id: "DT101",
    model: "HD785",
    excavator: 'EX203',
    times: ["00:27", "00:15", "00:24", "00:22"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
  },
  {
    index: '10',
    id: "DT102",
    model: "HD785",
    times: ["00:27", "00:15", "00:24"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX204',
  },
  {
    index: '11',
    id: "DT103",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22", '00:30'],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t", "9.8t"],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX204',
  },
  {
    index: '12',
    id: "DT104",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22", "00:18"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t", '9.8t'],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX204',
  },
  {
    index: '13',
    id: "DT104",
    model: "HD785",
    times: ["00:27", "00:15", "00:24", "00:22", "00:18"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t", '9.8t'],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX205',
  },
  {
    index: '14',
    id: "DT202",
    model: "HD1500",
    times: ["00:27", "00:15", "00:24", "00:22", "00:18"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t", '9.8t'],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX205',
  },
  {
    index: '15',
    id: "DT201",
    model: "HD1500",
    times: ["00:27", "00:15", "00:24", "00:22", "00:18"],
    weights: ["12.4t", "12.3t", "11.9t", "12.4t", "10.9t", '9.8t'],
    avgLoadingTime: "01:44",
    totalTonnes: "61.49 t",
    excavator: 'EX205',
  },
  // Add more truck data here
];

export const excavators = [
  {
    id: 'EX201',
    souroce: 'SWK_S01_420_002',
    synced: '6',
    hangTime: '00:23',
    avgHangTimeColor: '#FAAD14',
    syncTimeColor: 'green',
    position: [-1500, 730, 45]
  },
  {
    id: 'EX202',
    souroce: 'SWK_S01_420_003',
    synced: '3',
    hangTime: '00:40',
    avgHangTimeColor: '#CF1322',
    syncTimeColor: 'green',
    position: [-1650, 1230, 45]
  },
  {
    id: 'EX203',
    souroce: 'SWK_S01_420_001',
    synced: '5',
    hangTime: '00:38',
    avgHangTimeColor: '#CF1322',
    syncTimeColor: 'green',
    position: [512, -4096, 105]
  },
  {
    id: 'EX204',
    souroce: 'SWK_S01_420_004',
    synced: '10',
    hangTime: '00:37',
    avgHangTimeColor: '#389E0D',
    syncTimeColor: 'green',
    position: [-2560, -3072, 185]
  },
  {
    id: 'EX205',
    souroce: 'SWK_S01_420_003',
    synced: '10',
    hangTime: '00:19',
    avgHangTimeColor: '#389E0D',
    syncTimeColor: 'green',
    position: [4608, -4608, 185]
  }
]

type Truck = {
  index: string;
  id: string;
  model: string;
  excavator: string;
  times: string[];
  weights: string[];
  avgLoadingTime: string;
  totalTonnes: string;
  avgHangTime: string;
  colors: string[];
};

const randomTime = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
const randomWeight = (min: number, max: number): number => parseFloat((Math.random() * (max - min) + min).toFixed(1));

export const generateTruckData = (excavators: { id: string }[]): Truck[] => {
  const trucks: Truck[] = [];
  const models = ['HD785', 'HD1500'];
  const passesRange: { [key: string]: [number, number] } = {
    'HD785': [4, 6],
    'HD1500': [8, 9],
  };
  const colors = {
    normal: '#4CAF50',
    amber: '#FFC107',
    red: '#FF5252',
  };

  
  let index = 1;
  excavators.forEach(excavator => {
    const numTrucks = randomTime(3, 3); // Each excavator has 2 or 3 trucks
    
    let count = 1
    for (let t = 0; t < numTrucks; t++) {
      const model = models[Math.floor(Math.random() * models.length)];
      const [minPasses, maxPasses] = passesRange[model];
      const numPasses = randomTime(minPasses, maxPasses);
      const times: number[] = [];
      const weights: number[] = [];
      const colorsArray: string[] = Array(numPasses).fill(colors.normal);

      // Generate times
      for (let i = 0; i < numPasses - 1; i++) {
        const time = randomTime(10, 40); // Random time in seconds (10-40)
        times.push(time);
      }

      // Generate weights
      for (let i = 0; i < numPasses; i++) {
        const weight = randomWeight(10, 15); // Random weight between 10-15t
        weights.push(weight);
      }

      // Ensure only one pass is amber or red
      const specialPassIndex = Math.floor(Math.random() * numPasses);
      colorsArray[specialPassIndex] = Math.random() < 0.5 ? colors.amber : colors.red;

      // Calculate average loading time and total tonnes
      const avgLoadingTime = formatTime(
        Math.floor(times.reduce((sum, time) => sum + time, 0))
      );
      const avgHangTime = formatTime(
        randomTime(10, 40)
      );
      const totalTonnes = `${weights.reduce((sum, weight) => sum + weight, 0).toFixed(2)} t`;

      // Add to trucks array
      trucks.push({
        index: index.toString(),
        id: model === 'HD785' ? `DT10${count}` : `DT20${count}`,
        model,
        excavator: excavator.id,
        times: times.map(formatTime),
        weights: weights.map(w => `${w}t`),
        avgLoadingTime,
        avgHangTime,
        totalTonnes,
        colors: colorsArray,
      });
      count ++
      index++;
    }
  });

  return trucks;
};