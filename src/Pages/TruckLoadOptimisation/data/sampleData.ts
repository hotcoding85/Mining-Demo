import { LoadHaulCycleTimeBreakdownData } from "../interfaces";


export const PayloadWithData = {
  labels: [
    "75",
    "80",
    "85",
    "90",
    "95",
    "100",
    "105",
    "110",
    "115",
    "120",
    "125",
    "130",
    "135",
    "140"
  ],
  datasets: [
    {
      label: "with Mine Dynamics",
      data: [0, 0, 1, 1, 2, 8, 23, 36, 21, 6, 1, 0, 0, 0, 0, 0],
      backgroundColor: "#1890FF",
      barPercentage: 1,
      categoryPercentage: 0.4,
      barThickness: 33,
      borderRadius: {
        topLeft: 3,
        topRight: 3,
      },
    },
    {
      label: "Before",
      data: [6, 5, 2, 4, 10, 16, 20, 18, 13, 7, 3, 2, 1, 0, 0, 0],
      backgroundColor: "#FAAD14",
      barPercentage: 1,
      categoryPercentage: 0.4,
      barThickness: 33,
      borderRadius: {
        topLeft: 3,
        topRight: 3,
      },
    }
  ],
};


export const loadHaulCycleTimeBreakdownReport: LoadHaulCycleTimeBreakdownData[] = [
  {
    fleet: "Digger Fleet 1",
    cycleActivities: "Loading",
    target: 0,
    actualSiteAverage: "05:48",
    mineIdeal: "04:19",
  },
  {
    fleet: "",
    cycleActivities: "Hauling Full",
    target: 0,
    actualSiteAverage: "09:39",
    mineIdeal: "09:00",
  },
  {
    fleet: "",
    cycleActivities: "Tipping",
    target: 0,
    actualSiteAverage: "01:26",
    mineIdeal: "01:26",
  },
  {
    fleet: "",
    cycleActivities: "Travel Empty",
    target: 0,
    actualSiteAverage: "07:30",
    mineIdeal: "06:40",
  },
  {
    fleet: "",
    cycleActivities: "Queuing",
    target: 0,
    actualSiteAverage: "01:56",
    mineIdeal: "00:00",
  },
];

export const data = [
  [
    {
      "id": "1a",
      "equipmentName": "EX201",
      "loadsCompleted": "9/35",
      "trips": "1",
      "materialType": "Waste",
      "actualTonnes": "89",
      "totalPasses": "5",
      "truck": 'DT101',
      "model": 'HD1500',
      "loading": "00:02:34",
      "source": "EMU_S04_465_004",
      "pass1": "14.65t / 00:01:27",
      "pass2": "13.25t / 00:05:57",
      "pass3": "12.16t / 00:05:57",
      "pass4": "09.56t / 00:05:57",
      "pass5": "11.32t / 00:14:52",
    },
    {
      "id": "1a",
      "equipmentName": "EX201",
      "loadsCompleted": "9/35",
      "trips": "2",
      "materialType": "Waste",
      "actualTonnes": "79.6",
      "totalPasses": "5",
      "truck": 'DT102',
      "model": 'HD1500',
      "loading": "00:02:34",
      "source": "EMU_S04_465_004",
      "pass1": "14.65t / 00:01:27",
      "pass2": "13.25t / 00:05:57",
      "pass3": "12.16t / 00:05:57",
      "pass4": "09.56t / 00:05:57",
      "pass5": "11.32t / 00:14:52",
    },
    {
      "id": "1a",
      "equipmentName": "EX201",
      "loadsCompleted": "9/35",
      "trips": "1",
      "materialType": "LG01",
      "actualTonnes": "95.9",
      "totalPasses": "6",
      "model": 'HD785',
      "loading": "00:07:12",
      "source": "EMU_S04_465_004",
      "pass1": "14.65t / 00:01:27",
      "pass2": "13.25t / 00:05:57",
      "pass3": "12.16t / 00:05:57",
      "pass4": "09.56t / 00:05:57",
      "pass5": "11.32t / 00:14:52",
      "pass6": "11.56t / 00:14:52",
    },
    {
      "id": "1b",
      "equipmentName": "EX202",
      "loadsCompleted": "9/35",
      "trips": "1",
      "materialType": "Waste",
      "actualTonnes": "88.5",
      "totalPasses": "5",
      "truck": 'DT121',
      "model": 'HD1500',
      "loading": "00:05:36",
      "source": "EMU_S04_465_004",
      "pass1": "14.65t / 00:02:21",
      "pass2": "13.25t / 00:05:37",
      "pass3": "12.16t / 00:02:32",
      "pass4": "09.56t / 00:01:36",
      "pass5": "11.32t / 00:14:52",
    },
    {
      "id": "1c",
      "equipmentName": "EX205",
      "loadsCompleted": "9/35",
      "trips": "1",
      "materialType": "Waste",
      "actualTonnes": "108.5",
      "totalPasses": "5",
      "truck": 'DT122',
      "model": 'HD785',
      "loading": "00:05:36",
      "source": "EMU_S04_465_004",
      "pass1": "14.65t / 00:02:21",
      "pass2": "13.25t / 00:05:37",
      "pass3": "12.16t / 00:02:32",
      "pass4": "09.56t / 00:01:36",
      "pass5": "11.32t / 00:14:52",
    },
    {
      "id": "1c",
      "equipmentName": "EX205 ",
      "loadsCompleted": "9/35",
      "trips": "1",
      "materialType": "Waste",
      "actualTonnes": "78.5",
      "totalPasses": "5",
      "truck": 'DT124',
      "model": 'HD1500',
      "loading": "00:05:36",
      "source": "EMU_S04_465_004",
      "pass1": "14.65t / 00:02:21",
      "pass2": "13.25t / 00:05:37",
      "pass3": "12.16t / 00:02:32",
      "pass4": "09.56t / 00:01:36",
      "pass5": "11.32t / 00:14:52",
    },
  ]
]

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTime() {
  const minutes = getRandomInt(2, 6);
  const seconds = getRandomInt(0, 59);
  return `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getRandomLoadsCompleted() {
  const completed = getRandomInt(1, 35);
  const total = 35; // Total can be static or random as needed
  return `${completed}/${total}`;
}

function getRandomPass() {
  const tonnes = (getRandomInt(5, 15) + Math.random()).toFixed(2); // Random tonnes between 5 and 15
  return `${tonnes}t / ${getRandomTime()}`;
}

function getColor(model, actualTonnes, loading) {

  const capacity = model === 'HD1500' ? 150 : 85
  const minRange = capacity * .98
  const maxRange = capacity * 1.02
  const loadingInMinutes = parseInt(loading.split(':')[1]) + parseInt(loading.split(':')[2]) / 60; // Convert loading time to minutes
  if (actualTonnes >= minRange && actualTonnes <= maxRange && loadingInMinutes >= 2 && loadingInMinutes <= 5) {
      return 'blue';
  }
  return 'red';
}

// Utility function to convert "HH:MM:SS" to minutes
const convertLoadingTimeToMinutes = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 60 + minutes + seconds / 60;
};

export function generateRecords(n, model) {
  const records: any = [];
  const equipmentNames = ['EX201', 'EX202', 'EX203']; // Sample equipment names
  const materialTypes = ['Waste', 'Recycle', 'Material A', 'Material B'];
  const trucks = ['DT101', 'DT102', 'DT103'];
  const models = ['HD1500', 'HD785'];

  const capacity = model === 'HD1500' ? 150 : 85
  const minRange = capacity * .92
  const maxRange = capacity * 1.05

  for (let i = 0; i < n; i++) {
    const id = (i + 1).toString(36).padStart(2, '0'); // Generates IDs like '01', '02', etc.
    const actualTonnes = getRandomInt(minRange, maxRange).toString();
    const loading = getRandomTime();

    const record = {
      id: id,
      x: parseFloat(actualTonnes),
      y: convertLoadingTimeToMinutes(loading),
      equipmentName: equipmentNames[getRandomInt(0, equipmentNames.length - 1)],
      loadsCompleted: getRandomLoadsCompleted(),
      trips: getRandomInt(1, 10).toString(),
      materialType: materialTypes[getRandomInt(0, materialTypes.length - 1)],
      actualTonnes: actualTonnes,
      totalPasses: getRandomInt(1, 10).toString(),
      truck: trucks[getRandomInt(0, trucks.length - 1)],
      model: models[getRandomInt(0, models.length - 1)],
      loading: loading,
      source: `EMU_S${getRandomInt(1, 10)}_${getRandomInt(100, 999)}_${getRandomInt(100, 999)}`,
      pass1: getRandomPass(),
      pass2: getRandomPass(),
      pass3: getRandomPass(),
      pass4: getRandomPass(),
      pass5: getRandomPass(),
      colorFill: getColor(model, parseInt(actualTonnes), loading) 
    };
    records.push(record);
  }

  return records;
}

export function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

export function generateColorArray(n) {

  const colors: any = [];

  for (let i = 0; i < n; i++) {
    colors.push(getRandomColor());
  }

  return colors;
}

