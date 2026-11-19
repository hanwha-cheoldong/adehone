import type { MessagePortMain, UtilityProcess } from 'electron'
import type { CrashReportBreadcrumbData } from '../../shared/crash-reporting/crash-reporting'
import { recordDurableCrashBreadcrumb } from '../crash-reporting/breadcrumbs/durable-crash-breadcrumb'
import type { HostedWorker } from './hosted-worker'
import { utilityWorkerHeapData } from './utility-worker-heap-report'
import type {
  HostedWorkerThread,
  UtilityWorkerHeapReport,
  UtilityWorkerHostRequest
} from './utility-worker-host-protocol'

/** One utility process a UtilityWorkerHost started, and the workers it holds. */
export type Host = {
  child: UtilityProcess
  ready: boolean
  queued: { request: Extract<UtilityWorkerHostRequest, { type: 'spawn' }>; port: MessagePortMain }[]
  workers: Map<number, HostedWorker>
  readyTimer: ReturnType<typeof setTimeout>
  idleTimer?: ReturnType<typeof setTimeout>
  retired: boolean
  /** Its loss is counted once, by whichever of port close or process exit main hears first. */
  lossCounted: boolean
  /** The owner's context, taken at the first port close, before any worker fails. */
  exitContext?: CrashReportBreadcrumbData
  heap?: UtilityWorkerHeapReport
}

export function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

/** A child still launching has no PID to kill yet; kill it once it has one. */
export function stopChild(host: Host): void {
  if (!host.child.kill()) {
    host.child.once('spawn', () => host.child.kill())
  }
}

export function retireHost(host: Host): void {
  host.retired = true
  clearTimeout(host.readyTimer)
  clearTimeout(host.idleTimer)
  host.workers.clear()
  for (const { port } of host.queued.splice(0)) {
    port.close()
  }
}

export function recordHostExitedBreadcrumb(
  serviceName: string,
  host: Host,
  code: number,
  workers: readonly HostedWorker[],
  fallbackExitContext?: (workers: readonly HostedWorkerThread[]) => CrashReportBreadcrumbData
): void {
  const data: CrashReportBreadcrumbData = {
    serviceName,
    code,
    workers: workers.length,
    ...utilityWorkerHeapData(host.heap, workers)
  }
  workers.forEach((worker, index) => {
    data[`w${index}_role`] = worker.spawn.name
    data[`w${index}_lastReply`] = worker.lastReplyType
    data[`w${index}_receivedMB`] = Math.round(worker.receivedBytes / 2 ** 20)
  })
  // Before the workers fail, which ends what their owners were waiting on.
  Object.assign(data, host.exitContext ?? fallbackExitContext?.(workers))
  recordDurableCrashBreadcrumb('utility_worker_host_exited', data)
}

export function recordWorkerOutOfMemoryBreadcrumb(
  serviceName: string,
  host: Host,
  worker: HostedWorker,
  code?: string,
  exitContext?: (workers: readonly HostedWorkerThread[]) => CrashReportBreadcrumbData
): void {
  recordDurableCrashBreadcrumb('worker_thread_failed', {
    serviceName,
    role: worker.spawn.name,
    code: code ?? 'ERR_WORKER_OUT_OF_MEMORY',
    lastReply: worker.lastReplyType,
    receivedMB: Math.round(worker.receivedBytes / 2 ** 20),
    ...utilityWorkerHeapData(host.heap, [worker]),
    // Before the worker fails, which ends what its owner was waiting on.
    ...exitContext?.([worker])
  })
}
