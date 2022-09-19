export interface SystemCpu {
  name: string;
  description: string;
  baseUnit: unknown;
  measurements: { statisctic: string; value: number }[];
  availableTags: unknown[];
}
