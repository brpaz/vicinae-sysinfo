import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import { promisify } from 'node:util';
import type { SystemInfo } from '../types';

const execFileAsync = promisify(execFile);

async function readFileSafe(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return '';
  }
}

async function getOsName(): Promise<string> {
  const content = await readFileSafe('/etc/os-release');
  const match = content.match(/^PRETTY_NAME="?(.*?)"?$/m);
  return match?.[1] ?? `${os.type()} ${os.release()}`;
}

async function getCpuInfo(): Promise<{
  model: string;
  cores: number;
  threads: number;
}> {
  const cpus = os.cpus();
  const model = cpus[0]?.model.trim() ?? 'Unknown CPU';
  const threads = cpus.length;

  const cpuinfo = await readFileSafe('/proc/cpuinfo');
  const coresMatch = cpuinfo.match(/^cpu cores\s*:\s*(\d+)/m);
  const cores = coresMatch ? Number(coresMatch[1]) : threads;

  return { model, cores, threads };
}

async function getGpus(): Promise<string[]> {
  try {
    const { stdout } = await execFileAsync('lspci', ['-mm']);
    return stdout
      .split('\n')
      .filter((line) =>
        /"(VGA compatible controller|3D controller|Display controller)"/.test(
          line
        )
      )
      .map((line) => {
        // lspci -mm quotes each field: slot "class" "vendor" "device" ["subsys_vendor" "subsys_device"]
        const fields = [...line.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(
          (m) => m[1]
        );
        const [, vendor, device] = fields;
        return [vendor, device].filter(Boolean).join(' ');
      });
  } catch {
    return [];
  }
}

interface MemInfo {
  memTotal: number;
  memAvailable: number;
  swapTotal: number;
  swapFree: number;
}

async function getMemInfo(): Promise<MemInfo> {
  const content = await readFileSafe('/proc/meminfo');
  const field = (key: string) => {
    const match = content.match(new RegExp(`^${key}:\\s*(\\d+)\\s*kB`, 'm'));
    return match ? Number(match[1]) * 1024 : 0;
  };
  return {
    memTotal: field('MemTotal'),
    memAvailable: field('MemAvailable'),
    swapTotal: field('SwapTotal'),
    swapFree: field('SwapFree'),
  };
}

interface DiskInfo {
  total: number;
  used: number;
  available: number;
  usePercent: string;
}

async function getDiskInfo(path: string): Promise<DiskInfo> {
  try {
    const { stdout } = await execFileAsync('df', [
      '-B1',
      '--output=size,used,avail,pcent',
      path,
    ]);
    const line = stdout.trim().split('\n')[1] ?? '';
    const [total, used, available, usePercent] = line.trim().split(/\s+/);
    return {
      total: Number(total) || 0,
      used: Number(used) || 0,
      available: Number(available) || 0,
      usePercent: usePercent ?? 'N/A',
    };
  } catch {
    return { total: 0, used: 0, available: 0, usePercent: 'N/A' };
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const [osName, cpu, gpus, mem, disk] = await Promise.all([
    getOsName(),
    getCpuInfo(),
    getGpus(),
    getMemInfo(),
    getDiskInfo('/'),
  ]);

  return {
    os: osName,
    kernel: os.release(),
    hostname: os.hostname(),
    architecture: os.arch(),
    uptime: formatUptime(os.uptime()),
    desktop: process.env.XDG_CURRENT_DESKTOP ?? 'Unknown',
    sessionType: process.env.XDG_SESSION_TYPE ?? 'Unknown',
    cpuModel: cpu.model,
    cpuCores: cpu.cores,
    cpuThreads: cpu.threads,
    gpus: gpus.length > 0 ? gpus : ['Unknown'],
    memoryTotal: mem.memTotal,
    memoryAvailable: mem.memAvailable,
    swapTotal: mem.swapTotal,
    swapFree: mem.swapFree,
    diskTotal: disk.total,
    diskUsed: disk.used,
    diskAvailable: disk.available,
    diskUsePercent: disk.usePercent,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
