import { LoadHaulCycleTimeBreakdownData } from "../interfaces";

export const PayloadBeforeData = {
  labels: [
    "200",
    "220",
    "240",
    "260",
    "280",
    "300",
    "320",
    "340",
    "360",
    "380",
    "400",
    "420",
    "440",
    "460",
    "480",
    "500",
  ],
  datasets: [
    {
      label: "Ton Target",
      data: [1, 1, 2, 4, 10, 16, 20, 18, 13, 7, 3, 2, 1, 0, 0, 0],
      backgroundColor: "#FAAD14",
      barPercentage: 1,
      categoryPercentage: 0.4,
      barThickness: 33,
      borderRadius: {
        topLeft: 3,
        topRight: 3,
      },
    },
  ],
};

export const PayloadWithData = {
  labels: [
    "200",
    "220",
    "240",
    "260",
    "280",
    "300",
    "320",
    "340",
    "360",
    "380",
    "400",
    "420",
    "440",
    "460",
    "480",
    "500",
  ],
  datasets: [
    {
      label: "Ton Target",
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
