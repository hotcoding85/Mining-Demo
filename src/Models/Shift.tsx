import { Dayjs } from "dayjs"

export interface Shift {
    name: string
    description: string
    startTime: string
    endTime: string
    duration: number
}

export interface ShiftTimingsInfo {
    start: Dayjs
    end: Dayjs
    shiftDate: string
    shift: string
}