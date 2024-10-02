export interface LoadHaulCycleTimeBreakdownData {
  fleet: string,
  cycleActivities: string,
  target: number,
  actualSiteAverage: string,
  mineIdeal: string,
}

export interface LoadHaulCycleTimeBreakdownReport {
  cycleActivities: string,
  actualSiteAverage: string,
  mineIdeal: string,
  deviation: string
}