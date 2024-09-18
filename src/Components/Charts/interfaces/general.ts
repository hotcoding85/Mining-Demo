export interface TripProgressBarProps {
  completed: number;
  forecast: number;
  planned?: number; 
  type?: 'Production' | 'Trucking';
  header?:string;
  subHeader?:string;
  subType?:string;
  backgroundCol?:string
  total?: number;
  widthVal?:string;
  useCustomLabels?: boolean;
  customLabels?: string[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor: string;
  barPercentage: number;
  categoryPercentage: number;
  barThickness: number;
  borderRadius: {
    topLeft: number;
    topRight: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface CustomBarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    barPercentage: number;
    categoryPercentage: number;
    barThickness: number;
    borderRadius: {
      topLeft: number;
      topRight: number;
    };
  }[];
}

export interface TextColor {
  text: string;
  color: string;
}

export interface CustomLineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number; 
    pointRadius: number; 
  }[];
}

