/**
 * kiwivm-api-types
 *
 * TypeScript types and axios-based client for BandwagonHost (搬瓦工) KiwiVM REST API.
 *
 * @example
 * ```ts
 * import { KiwiVMClient } from "kiwivm-api-types";
 *
 * const client = new KiwiVMClient({
 *   veid: 671428,
 *   apiKey: "YOUR_API_KEY",
 * });
 *
 * const info = await client.getServiceInfo();
 * console.log(info.hostname);
 * ```
 */

// Client
export { KiwiVMClient, KiwiVMApiError } from "./client";

// Types
export type {
  KiwiVMClientOptions,
  KiwiVMBaseResponse,
  // VPS Lifecycle
  StartResponse,
  StopResponse,
  RestartResponse,
  KillResponse,
  // Service Information
  IpNullrouteInfo,
  GetServiceInfoResponse,
  GetLiveServiceInfoBase,
  GetLiveServiceInfoOVZResponse,
  GetLiveServiceInfoKVMResponse,
  GetLiveServiceInfoResponse,
  // OS Management
  GetAvailableOSResponse,
  ReinstallOSParams,
  ReinstallOSResponse,
  // SSH Keys
  UpdateSshKeysParams,
  UpdateSshKeysResponse,
  GetSshKeysResponse,
  // Root Password
  ResetRootPasswordResponse,
  // Usage & Stats
  GetUsageGraphsResponse,
  GetRawUsageStatsResponse,
  AuditLogEntry,
  GetAuditLogResponse,
  // Hostname & DNS
  SetHostnameParams,
  SetHostnameResponse,
  SetPTRParams,
  SetPTRResponse,
  // ISO
  IsoMountParams,
  IsoMountResponse,
  IsoUnmountResponse,
  // Shell
  BasicShellCdParams,
  BasicShellCdResponse,
  BasicShellExecParams,
  BasicShellExecResponse,
  ShellScriptExecParams,
  ShellScriptExecResponse,
  // Snapshots
  SnapshotCreateParams,
  SnapshotCreateResponse,
  SnapshotInfo,
  SnapshotListResponse,
  SnapshotActionParams,
  SnapshotDeleteResponse,
  SnapshotRestoreResponse,
  SnapshotToggleStickyParams,
  SnapshotToggleStickyResponse,
  SnapshotExportParams,
  SnapshotExportResponse,
  SnapshotImportParams,
  SnapshotImportResponse,
  // Backups
  BackupInfo,
  BackupListResponse,
  BackupCopyToSnapshotParams,
  BackupCopyToSnapshotResponse,
  // IPv6
  Ipv6AddResponse,
  Ipv6DeleteParams,
  Ipv6DeleteResponse,
  // Migration
  MigrateGetLocationsResponse,
  MigrateStartParams,
  MigrateStartResponse,
  // Cloning
  CloneFromExternalServerParams,
  CloneFromExternalServerResponse,
  // Suspension
  SuspensionRecord,
  GetSuspensionDetailsResponse,
  PolicyViolationRecord,
  GetPolicyViolationsResponse,
  RecordIdParams,
  UnsuspendResponse,
  ResolvePolicyViolationResponse,
  // Rate Limit
  GetRateLimitStatusResponse,
  // Private IP
  PrivateIpGetAvailableIpsResponse,
  PrivateIpAssignParams,
  PrivateIpAssignResponse,
  PrivateIpDeleteParams,
  PrivateIpDeleteResponse,
  // Notifications
  GetNotificationPreferencesResponse,
  SetNotificationPreferencesParams,
  SetNotificationPreferencesResponse,
} from "./types";
