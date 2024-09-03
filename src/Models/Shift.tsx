import { Dayjs } from "dayjs"

export interface Shift {
    label: string
    value: string
    startTime: string
    endTime: string
}

export interface ShiftTimingsInfo {
    start: Dayjs
    end: Dayjs
    shiftDate: string
    shift: string
}