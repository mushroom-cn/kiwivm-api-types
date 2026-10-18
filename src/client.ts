/**
 * KiwiVM REST API Client
 *
 * Axios-based client for BandwagonHost (搬瓦工) KiwiVM API.
 * Provides a typed, method-based interface for all API endpoints.
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
 * // Start the VPS
 * const result = await client.start();
 *
 * // Get service info
 * const info = await client.getServiceInfo();
 * console.log(info.hostname); // "my.server.com"
 *
 * // Create a snapshot
 * await client.snapshotCreate({ description: "Before upgrade" });
 * ```
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  KiwiVMClientOptions,
  KiwiVMBaseResponse,
  // VPS Lifecycle
  StartResponse,
  StopResponse,
  RestartResponse,
  KillResponse,
  // Service Information
  GetServiceInfoResponse,
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
  GetSuspensionDetailsResponse,
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

// ============================================================================
// Error
// ============================================================================

/**
 * Error thrown when the KiwiVM API returns a non-zero error code.
 */
export class KiwiVMApiError extends Error {
  /** API error code (non-zero) */
  public readonly errorCode: number;
  /** API endpoint that was called */
  public readonly endpoint: string;

  constructor(errorCode: number, message: string, endpoint: string) {
    super(`KiwiVM API error [${endpoint}]: code=${errorCode}, ${message}`);
    this.name = "KiwiVMApiError";
    this.errorCode = errorCode;
    this.endpoint = endpoint;
  }
}

// ============================================================================
// Client
// ============================================================================

const DEFAULT_BASE_URL = "https://api.64clouds.com/v1";
const DEFAULT_TIMEOUT = 30_000;

export class KiwiVMClient {
  private readonly veid: number;
  private readonly apiKey: string;
  private readonly http: AxiosInstance;

  constructor(options: KiwiVMClientOptions) {
    this.veid = options.veid;
    this.apiKey = options.apiKey;

    this.http = axios.create({
      baseURL: options.baseURL ?? DEFAULT_BASE_URL,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Response interceptor: check for API-level errors
    this.http.interceptors.response.use(
      (response) => {
        const data = response.data as KiwiVMBaseResponse;
        if (data && typeof data.error === "number" && data.error !== 0) {
          const endpoint = response.config.url ?? "unknown";
          return Promise.reject(
            new KiwiVMApiError(data.error, data.message ?? "Unknown error", endpoint)
          );
        }
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  // --------------------------------------------------------------------------
  // Internal helper
  // --------------------------------------------------------------------------

  /**
   * Sends a POST request to the given endpoint with veid + api_key merged in.
   * Returns the parsed response data.
   */
  private async call<T extends KiwiVMBaseResponse>(
    endpoint: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    const body = new URLSearchParams();
    const merged = { veid: this.veid, api_key: this.apiKey, ...params };

    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== null) {
        body.append(key, String(value));
      }
    }

    const { data } = await this.http.post<T>(endpoint, body.toString());
    return data;
  }

  // --------------------------------------------------------------------------
  // VPS Lifecycle
  // --------------------------------------------------------------------------

  /** Starts the VPS. */
  async start(): Promise<StartResponse> {
    return this.call<StartResponse>("start");
  }

  /** Stops the VPS. */
  async stop(): Promise<StopResponse> {
    return this.call<StopResponse>("stop");
  }

  /** Reboots the VPS. */
  async restart(): Promise<RestartResponse> {
    return this.call<RestartResponse>("restart");
  }

  /**
   * Forcibly stops a VPS that is stuck.
   * WARNING: Any unsaved data will be lost.
   */
  async kill(): Promise<KillResponse> {
    return this.call<KillResponse>("kill");
  }

  // --------------------------------------------------------------------------
  // Service Information
  // --------------------------------------------------------------------------

  /**
   * Returns detailed VPS information: plan, network, OS, data transfer, etc.
   */
  async getServiceInfo(): Promise<GetServiceInfoResponse> {
    return this.call<GetServiceInfoResponse>("getServiceInfo");
  }

  /**
   * Returns all getServiceInfo data plus live VPS status.
   * WARNING: May take up to 15 seconds.
   */
  async getLiveServiceInfo(): Promise<GetLiveServiceInfoResponse> {
    return this.call<GetLiveServiceInfoResponse>("getLiveServiceInfo");
  }

  // --------------------------------------------------------------------------
  // OS Management
  // --------------------------------------------------------------------------

  /** Returns currently installed OS and available OS templates. */
  async getAvailableOS(): Promise<GetAvailableOSResponse> {
    return this.call<GetAvailableOSResponse>("getAvailableOS");
  }

  /**
   * Reinstalls the Operating System.
   * @param params.os - OS template identifier
   */
  async reinstallOS(params: ReinstallOSParams): Promise<ReinstallOSResponse> {
    return this.call<ReinstallOSResponse>("reinstallOS", { os: params.os });
  }

  // --------------------------------------------------------------------------
  // SSH Key Management
  // --------------------------------------------------------------------------

  /**
   * Updates per-VM SSH keys in the Hypervisor Vault.
   * Keys are written during reinstallOS. Overrides Billing Portal keys.
   */
  async updateSshKeys(params: UpdateSshKeysParams): Promise<UpdateSshKeysResponse> {
    return this.call<UpdateSshKeysResponse>("updateSshKeys", {
      ssh_keys: params.ssh_keys,
    });
  }

  /** Retrieves SSH keys from both Hypervisor Vault and Billing Portal. */
  async getSshKeys(): Promise<GetSshKeysResponse> {
    return this.call<GetSshKeysResponse>("getSshKeys");
  }

  // --------------------------------------------------------------------------
  // Root Password
  // --------------------------------------------------------------------------

  /** Generates and sets a new root password. */
  async resetRootPassword(): Promise<ResetRootPasswordResponse> {
    return this.call<ResetRootPasswordResponse>("resetRootPassword");
  }

  // --------------------------------------------------------------------------
  // Usage & Statistics
  // --------------------------------------------------------------------------

  /** @deprecated Obsolete. Use getRawUsageStats instead. */
  async getUsageGraphs(): Promise<GetUsageGraphsResponse> {
    return this.call<GetUsageGraphsResponse>("getUsageGraphs");
  }

  /** Returns detailed usage statistics (as shown in KiwiVM Detailed Statistics). */
  async getRawUsageStats(): Promise<GetRawUsageStatsResponse> {
    return this.call<GetRawUsageStatsResponse>("getRawUsageStats");
  }

  /** Returns the detailed audit log (as shown in KiwiVM Audit Log). */
  async getAuditLog(): Promise<GetAuditLogResponse> {
    return this.call<GetAuditLogResponse>("getAuditLog");
  }

  // --------------------------------------------------------------------------
  // Hostname & DNS
  // --------------------------------------------------------------------------

  /** Sets a new hostname for the VPS. */
  async setHostname(params: SetHostnameParams): Promise<SetHostnameResponse> {
    return this.call<SetHostnameResponse>("setHostname", {
      newHostname: params.newHostname,
    });
  }

  /** Sets a PTR (rDNS) record for an IP address. */
  async setPTR(params: SetPTRParams): Promise<SetPTRResponse> {
    return this.call<SetPTRResponse>("setPTR", {
      ip: params.ip,
      ptr: params.ptr,
    });
  }

  // --------------------------------------------------------------------------
  // ISO Management
  // --------------------------------------------------------------------------

  /**
   * Mounts an ISO image. VM must be shut down and restarted after this call.
   */
  async isoMount(params: IsoMountParams): Promise<IsoMountResponse> {
    return this.call<IsoMountResponse>("iso/mount", { iso: params.iso });
  }

  /**
   * Unmounts the ISO image and configures boot from primary storage.
   * VM must be shut down and restarted after this call.
   */
  async isoUnmount(): Promise<IsoUnmountResponse> {
    return this.call<IsoUnmountResponse>("iso/unmount");
  }

  // --------------------------------------------------------------------------
  // Basic Shell
  // --------------------------------------------------------------------------

  /**
   * Simulates a "cd" command inside the VPS.
   */
  async basicShellCd(params: BasicShellCdParams): Promise<BasicShellCdResponse> {
    return this.call<BasicShellCdResponse>("basicShell/cd", {
      currentDir: params.currentDir,
      newDir: params.newDir,
    });
  }

  /**
   * Executes a shell command synchronously on the VPS.
   */
  async basicShellExec(params: BasicShellExecParams): Promise<BasicShellExecResponse> {
    return this.call<BasicShellExecResponse>("basicShell/exec", {
      command: params.command,
    });
  }

  /**
   * Executes a shell script asynchronously on the VPS.
   * Returns the name of the output log file.
   */
  async shellScriptExec(params: ShellScriptExecParams): Promise<ShellScriptExecResponse> {
    return this.call<ShellScriptExecResponse>("shellScript/exec", {
      script: params.script,
    });
  }

  // --------------------------------------------------------------------------
  // Snapshot Management
  // --------------------------------------------------------------------------

  /** Creates a snapshot of the current VPS state. */
  async snapshotCreate(params?: SnapshotCreateParams): Promise<SnapshotCreateResponse> {
    return this.call<SnapshotCreateResponse>("snapshot/create", {
      description: params?.description,
    });
  }

  /** Returns a list of all snapshots. */
  async snapshotList(): Promise<SnapshotListResponse> {
    return this.call<SnapshotListResponse>("snapshot/list");
  }

  /**
   * Deletes a snapshot by fileName.
   * @param params.snapshot - fileName from snapshotList
   */
  async snapshotDelete(params: SnapshotActionParams): Promise<SnapshotDeleteResponse> {
    return this.call<SnapshotDeleteResponse>("snapshot/delete", {
      snapshot: params.snapshot,
    });
  }

  /**
   * Restores a snapshot by fileName. WARNING: Overwrites all VPS data.
   * @param params.snapshot - fileName from snapshotList
   */
  async snapshotRestore(params: SnapshotActionParams): Promise<SnapshotRestoreResponse> {
    return this.call<SnapshotRestoreResponse>("snapshot/restore", {
      snapshot: params.snapshot,
    });
  }

  /**
   * Toggles the "sticky" attribute on a snapshot.
   * Sticky snapshots are never automatically purged.
   */
  async snapshotToggleSticky(params: SnapshotToggleStickyParams): Promise<SnapshotToggleStickyResponse> {
    return this.call<SnapshotToggleStickyResponse>("snapshot/toggleSticky", {
      snapshot: params.snapshot,
      sticky: params.sticky,
    });
  }

  /**
   * Exports a snapshot, generating a transfer token for import on another instance.
   */
  async snapshotExport(params: SnapshotExportParams): Promise<SnapshotExportResponse> {
    return this.call<SnapshotExportResponse>("snapshot/export", {
      snapshot: params.snapshot,
    });
  }

  /**
   * Imports a snapshot from another instance using its VEID and transfer token.
   */
  async snapshotImport(params: SnapshotImportParams): Promise<SnapshotImportResponse> {
    return this.call<SnapshotImportResponse>("snapshot/import", {
      sourceVeid: params.sourceVeid,
      sourceToken: params.sourceToken,
    });
  }

  // --------------------------------------------------------------------------
  // Backup Management
  // --------------------------------------------------------------------------

  /** Returns a list of automatic backups. */
  async backupList(): Promise<BackupListResponse> {
    return this.call<BackupListResponse>("backup/list");
  }

  /**
   * Copies a backup into a restorable Snapshot.
   * @param params.backupToken - Token from backupList
   */
  async backupCopyToSnapshot(params: BackupCopyToSnapshotParams): Promise<BackupCopyToSnapshotResponse> {
    return this.call<BackupCopyToSnapshotResponse>("backup/copyToSnapshot", {
      backupToken: params.backupToken,
    });
  }

  // --------------------------------------------------------------------------
  // IPv6 Management
  // --------------------------------------------------------------------------

  /** Assigns a new IPv6 /64 subnet. */
  async ipv6Add(): Promise<Ipv6AddResponse> {
    return this.call<Ipv6AddResponse>("ipv6/add");
  }

  /** Releases a specified IPv6 /64 subnet. */
  async ipv6Delete(params: Ipv6DeleteParams): Promise<Ipv6DeleteResponse> {
    return this.call<Ipv6DeleteResponse>("ipv6/delete", { ip: params.ip });
  }

  // --------------------------------------------------------------------------
  // Migration
  // --------------------------------------------------------------------------

  /** Returns all available migration locations. */
  async migrateGetLocations(): Promise<MigrateGetLocationsResponse> {
    return this.call<MigrateGetLocationsResponse>("migrate/getLocations");
  }

  /**
   * Starts VPS migration to a new datacenter.
   * WARNING: All IPv4 addresses will be replaced.
   */
  async migrateStart(params: MigrateStartParams): Promise<MigrateStartResponse> {
    return this.call<MigrateStartResponse>("migrate/start", {
      location: params.location,
    });
  }

  // --------------------------------------------------------------------------
  // Server Cloning (OVZ only)
  // --------------------------------------------------------------------------

  /** Clones a remote server/VPS into this instance (OVZ only). */
  async cloneFromExternalServer(params: CloneFromExternalServerParams): Promise<CloneFromExternalServerResponse> {
    return this.call<CloneFromExternalServerResponse>("cloneFromExternalServer", {
      externalServerIP: params.externalServerIP,
      externalServerSSHport: params.externalServerSSHport,
      externalServerRootPassword: params.externalServerRootPassword,
    });
  }

  // --------------------------------------------------------------------------
  // Suspension & Policy Violations
  // --------------------------------------------------------------------------

  /** Retrieves suspension details including abuse points and evidence. */
  async getSuspensionDetails(): Promise<GetSuspensionDetailsResponse> {
    return this.call<GetSuspensionDetailsResponse>("getSuspensionDetails");
  }

  /** Retrieves active policy violations. */
  async getPolicyViolations(): Promise<GetPolicyViolationsResponse> {
    return this.call<GetPolicyViolationsResponse>("getPolicyViolations");
  }

  /**
   * Clears an abuse issue and unsuspends the VPS.
   * @param params.record_id - Case ID from getSuspensionDetails
   */
  async unsuspend(params: RecordIdParams): Promise<UnsuspendResponse> {
    return this.call<UnsuspendResponse>("unsuspend", {
      record_id: params.record_id,
    });
  }

  /**
   * Marks a policy violation as resolved to avoid service suspension.
   * @param params.record_id - Case ID from getPolicyViolations
   */
  async resolvePolicyViolation(params: RecordIdParams): Promise<ResolvePolicyViolationResponse> {
    return this.call<ResolvePolicyViolationResponse>("resolvePolicyViolation", {
      record_id: params.record_id,
    });
  }

  // --------------------------------------------------------------------------
  // Rate Limiting
  // --------------------------------------------------------------------------

  /** Returns current API rate limit status (15min and 24h windows). */
  async getRateLimitStatus(): Promise<GetRateLimitStatusResponse> {
    return this.call<GetRateLimitStatusResponse>("getRateLimitStatus");
  }

  // --------------------------------------------------------------------------
  // Private IP Management
  // --------------------------------------------------------------------------

  /** Returns all available (free) private IPv4 addresses. */
  async privateIpGetAvailableIps(): Promise<PrivateIpGetAvailableIpsResponse> {
    return this.call<PrivateIpGetAvailableIpsResponse>("privateIp/getAvailableIps");
  }

  /**
   * Assigns a private IP address. If no IP specified, a random one is assigned.
   */
  async privateIpAssign(params?: PrivateIpAssignParams): Promise<PrivateIpAssignResponse> {
    return this.call<PrivateIpAssignResponse>("privateIp/assign", {
      ip: params?.ip,
    });
  }

  /** Deletes a private IP address from the VM. */
  async privateIpDelete(params: PrivateIpDeleteParams): Promise<PrivateIpDeleteResponse> {
    return this.call<PrivateIpDeleteResponse>("privateIp/delete", {
      ip: params.ip,
    });
  }

  // --------------------------------------------------------------------------
  // Notification Preferences
  // --------------------------------------------------------------------------

  /** Returns all notification settings and their current state. */
  async getNotificationPreferences(): Promise<GetNotificationPreferencesResponse> {
    return this.call<GetNotificationPreferencesResponse>("kiwivm/getNotificationPreferences");
  }

  /**
   * Changes notification preferences.
   * @param params.json_notification_preferences - JSON string of preference_id → 0/1
   */
  async setNotificationPreferences(
    params: SetNotificationPreferencesParams
  ): Promise<SetNotificationPreferencesResponse> {
    return this.call<SetNotificationPreferencesResponse>("kiwivm/setNotificationPreferences", {
      json_notification_preferences: params.json_notification_preferences,
    });
  }
}
