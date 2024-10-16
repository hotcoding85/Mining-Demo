export interface Employee {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    role: string;
    skills: string[];
    status: 'ACTIVE' | 'ARCHIVE';
    startDate: string;
    endDate: string;
    shifts?: Shift[] | null;
}
  
export interface Shift {
    date: string;  // e.g., '2024-10-10'
    type: 'FI' | 'FO' | 'R&R' | 'DS' | 'NS';
}

export const bgColors = {
    'DS': '#007bff',
    'NS': '#2e2e2e',
    'R&R': '#9b7800',
    'FI': '#009b11',
    'FO': '#ff5733'
}