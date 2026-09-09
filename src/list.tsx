import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  showToast,
  Toast,
} from '@vicinae/api';
import { useCallback, useEffect, useState } from 'react';
import type { SystemInfo } from './types';
import { formatBytes, getSystemInfo } from './utils/sysinfo';

function asText(info: SystemInfo): string {
  return [
    `OS: ${info.os}`,
    `Kernel: ${info.kernel}`,
    `Hostname: ${info.hostname}`,
    `Architecture: ${info.architecture}`,
    `Uptime: ${info.uptime}`,
    `Desktop: ${info.desktop} (${info.sessionType})`,
    `CPU: ${info.cpuModel} (${info.cpuCores} cores / ${info.cpuThreads} threads)`,
    `GPU: ${info.gpus.join(', ')}`,
    `Memory: ${formatBytes(info.memoryTotal - info.memoryAvailable)} / ${formatBytes(info.memoryTotal)}`,
    `Swap: ${formatBytes(info.swapTotal - info.swapFree)} / ${formatBytes(info.swapTotal)}`,
    `Disk (/): ${formatBytes(info.diskUsed)} / ${formatBytes(info.diskTotal)} (${info.diskUsePercent})`,
  ].join('\n');
}

export default function Command() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setInfo(await getSystemInfo());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      showToast({
        style: Toast.Style.Failure,
        title: 'Failed to read system info',
        message,
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markdown = error
    ? `# System Info\n\nCould not read system info: ${error}`
    : info
      ? `# ${info.os}\n\n${info.hostname} · ${info.kernel} · ${info.architecture}`
      : '# System Info\n\nLoading…';

  return (
    <Detail
      markdown={markdown}
      metadata={
        info && (
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Operating System"
              text={info.os}
              icon={Icon.Desktop}
            />
            <Detail.Metadata.Label
              title="Kernel"
              text={info.kernel}
              icon={Icon.Cog}
            />
            <Detail.Metadata.Label
              title="Hostname"
              text={info.hostname}
              icon={Icon.Monitor}
            />
            <Detail.Metadata.Label
              title="Architecture"
              text={info.architecture}
              icon={Icon.Cog}
            />
            <Detail.Metadata.Label
              title="Uptime"
              text={info.uptime}
              icon={Icon.Clock}
            />
            <Detail.Metadata.Label
              title="Desktop"
              text={`${info.desktop} (${info.sessionType})`}
              icon={Icon.AppWindow}
            />
            <Detail.Metadata.Separator />
            <Detail.Metadata.Label
              title="CPU"
              text={`${info.cpuModel} (${info.cpuCores} cores / ${info.cpuThreads} threads)`}
              icon={Icon.Gauge}
            />
            <Detail.Metadata.Label
              title="GPU"
              text={info.gpus.join(', ')}
              icon={Icon.Monitor}
            />
            <Detail.Metadata.Label
              title="Memory"
              text={`${formatBytes(info.memoryTotal - info.memoryAvailable)} / ${formatBytes(info.memoryTotal)}`}
              icon={Icon.Gauge}
            />
            <Detail.Metadata.Label
              title="Swap"
              text={
                info.swapTotal > 0
                  ? `${formatBytes(info.swapTotal - info.swapFree)} / ${formatBytes(info.swapTotal)}`
                  : 'None'
              }
              icon={Icon.Gauge}
            />
            <Detail.Metadata.Label
              title="Disk (/)"
              text={`${formatBytes(info.diskUsed)} / ${formatBytes(info.diskTotal)} (${info.diskUsePercent})`}
              icon={Icon.Gauge}
            />
          </Detail.Metadata>
        )
      }
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={refresh}
          />
          {info && (
            <Action.CopyToClipboard
              title="Copy All as Text"
              content={asText(info)}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
