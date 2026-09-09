export interface SystemInfo {
  os: string;
  kernel: string;
  hostname: string;
  architecture: string;
  uptime: string;
  desktop: string;
  sessionType: string;
  cpuModel: string;
  cpuCores: number;
  cpuThreads: number;
  gpus: string[];
  memoryTotal: number;
  memoryAvailable: number;
  swapTotal: number;
  swapFree: number;
  diskTotal: number;
  diskUsed: number;
  diskAvailable: number;
  diskUsePercent: string;
}
