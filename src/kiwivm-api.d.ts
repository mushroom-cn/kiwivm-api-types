/**
 * BandwagonHost (搬瓦工) KiwiVM REST API - TypeScript Type Declarations
 *
 * API Base URL: https://api.64clouds.com/v1/
 *
 * All API calls require a valid combination of VEID (VPS ID) and the corresponding API key.
 * All parameters can be passed using either GET or POST methods.
 * Every API call returns an `error` field. If `error` is non-zero, refer to the `message` field for details.
 *
 * @see https://bandwagonhost.com/kiwivm-wiki-REST-API
 */

// ============================================================================
// Common / Base Types
// ============================================================================

/**
 * Base request parameters required by every KiwiVM API call.
 * All parameters can be passed via GET query string or POST body.
 */
interface KiwiVMBaseRequest {
  /** VPS instance ID (VEID) */
  veid: number;
  /** API key associated with the VPS instance */
  api_key: string;
}

/**
 * Base response returned by every KiwiVM API call.
 * If `error` is non-zero, `message` contains the error description.
 */
interface KiwiVMBaseResponse {
  /**
   * Error code. 0 = success, non-zero = error occurred.
   * When non-zero, refer to `message` for detailed error information.
   */
  error: number;
  /** Human-readable error message (present when error is non-zero) */
  message?: string;
}

// ============================================================================
// VPS Lifecycle
// ============================================================================

/**
 * POST /v1/start
 * Starts the VPS.
 */
interface StartRequest extends KiwiVMBaseRequest {}
interface StartResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/stop
 * Stops the VPS.
 */
interface StopRequest extends KiwiVMBaseRequest {}
interface StopResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/restart
 * Reboots the VPS.
 */
interface RestartRequest extends KiwiVMBaseRequest {}
interface RestartResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/kill
 * Forcibly stops a VPS that is stuck and cannot be stopped by normal means.
 * WARNING: Any unsaved data will be lost. Use with great care.
 */
interface KillRequest extends KiwiVMBaseRequest {}
interface KillResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Service Information
// ============================================================================

/**
 * POST /v1/getServiceInfo
 * Returns detailed information about the VPS instance including plan details,
 * network configuration, OS, data transfer usage, and more.
 */
interface GetServiceInfoRequest extends KiwiVMBaseRequest {}

/**
 * Information about IP address nullrouting during (D)DoS attacks.
 */
interface IpNullrouteInfo {
  /** UNIX timestamp when the attack started */
  nullroute_timestamp: number;
  /** Duration of the nullroute in seconds */
  nullroute_duration_s: number;
  /** Raw packet dump data of the attack (multi-line string) */
  log: string;
}

interface GetServiceInfoResponse extends KiwiVMBaseResponse {
  /** Hypervisor type: "ovz" (OpenVZ) or "kvm" (KVM) */
  vm_type: "ovz" | "kvm";
  /** Hostname of the VPS */
  hostname: string;
  /** Internal nickname of the physical node */
  node_alias: string;
  /** Physical location (country, state) */
  node_location: string;
  /** Whether IPv6 is supported at the current location */
  location_ipv6_ready: boolean;
  /** Name of the hosting plan (e.g. "micro128") */
  plan: string;
  /** Disk quota in bytes */
  plan_disk: number;
  /** RAM in bytes */
  plan_ram: number;
  /** SWAP in bytes */
  plan_swap: number;
  /** Operating system identifier (e.g. "centos-6-x86_64") */
  os: string;
  /** Primary e-mail address of the account */
  email: string;
  /**
   * Allowed monthly data transfer in bytes.
   * Needs to be multiplied by `monthly_data_multiplier`.
   */
  plan_monthly_data: number;
  /**
   * Data transfer used in the current billing month.
   * Needs to be multiplied by `monthly_data_multiplier`.
   */
  data_counter: number;
  /**
   * Bandwidth accounting coefficient for locations with more expensive bandwidth.
   * Multiply with `plan_monthly_data` and `data_counter` to get actual values.
   */
  monthly_data_multiplier: number;
  /** UNIX timestamp of the next data transfer counter reset */
  data_next_reset: number;
  /** IPv4 addresses and IPv6 /64 subnets assigned to the VPS */
  ip_addresses: string[];
  /** Private IPv4 addresses assigned to the VPS */
  private_ip_addresses: string[];
  /**
   * Information on IP address nullrouting during (D)DoS attacks.
   * Key is the IP address under attack, value contains attack details.
   */
  ip_nullroutes: Record<string, IpNullrouteInfo>;
  /** Mounted ISO image #1 (empty string if none) */
  iso1: string;
  /** Mounted ISO image #2 (currently unsupported) */
  iso2: string;
  /** Array of ISO image identifiers available for use */
  available_isos: string[];
  /** Maximum number of IPv6 /64 subnets allowed by the plan */
  plan_max_ipv6s: number;
  /** Whether rDNS (PTR) records can be set via API */
  rdns_api_available: 0 | 1;
  /** Whether Private Network features are available on this plan */
  plan_private_network_available: 0 | 1;
  /** Whether Private Network features are available at this location */
  location_private_network_available: 0 | 1;
  /**
   * rDNS records. Key is the IP address, value is the PTR hostname.
   * e.g. { "1.2.3.4": "ns1.my.server.com" }
   */
  ptr: Record<string, string>;
  /** Whether the VPS is currently suspended (0 = no, 1 = yes) */
  suspended: 0 | 1;
  /** Whether there is an active policy violation that needs attention */
  policy_violation: 0 | 1;
  /** Number of times the service was suspended in the current calendar year */
  suspension_count: number;
  /** Total abuse points accumulated in the current calendar year */
  total_abuse_points: number;
  /** Maximum abuse points allowed by the plan in a calendar year */
  max_abuse_points: number;
}

// ============================================================================
// Live Service Information
// ============================================================================

/**
 * POST /v1/getLiveServiceInfo
 * Returns all data provided by getServiceInfo, plus detailed live status of the VPS.
 * WARNING: This call may take up to 15 seconds to complete.
 *
 * Return values differ by hypervisor type (OVZ vs KVM).
 */
interface GetLiveServiceInfoRequest extends KiwiVMBaseRequest {}

/**
 * Common fields present in getLiveServiceInfo response (extends getServiceInfo fields).
 */
interface GetLiveServiceInfoBase extends GetServiceInfoResponse {
  /**
   * CPU throttling status.
   * 0 = CPU is not throttled
   * 1 = CPU is throttled due to high usage (resets automatically every 2 hours)
   */
  is_cpu_throttled: 0 | 1;
  /** SSH port of the VPS */
  ssh_port: number;
}

/**
 * OpenVZ (OVZ) hypervisor specific fields.
 */
interface GetLiveServiceInfoOVZResponse extends GetLiveServiceInfoBase {
  /**
   * OpenVZ beancounters, system load average, number of processes,
   * open files, sockets, memory usage etc.
   */
  vz_status: Record<string, unknown>;
  /** OpenVZ disk size, inodes and usage info */
  vz_quota: Record<string, unknown>;
}

/**
 * KVM hypervisor specific fields.
 */
interface GetLiveServiceInfoKVMResponse extends GetLiveServiceInfoBase {
  /** VPS status: "Starting", "Running" or "Stopped" */
  ve_status: "Starting" | "Running" | "Stopped";
  /** MAC address of primary network interface */
  ve_mac1: string;
  /** Occupied (mapped) disk space in bytes */
  ve_used_disk_space_b: number;
  /** Actual size of disk image in GB */
  ve_disk_quota_gb: number;
  /**
   * Disk I/O throttling status.
   * 0 = Disk I/O is not throttled
   * 1 = Disk I/O is throttled due to high usage (resets every 15-180 minutes depending on sustained I/O utilization)
   */
  is_disk_throttled: 0 | 1;
  /** Result of "hostname" command executed inside the VPS */
  live_hostname: string;
  /** Raw load average string (e.g. "0.00 0.01 0.05") */
  load_average: string;
  /** Amount of available RAM in KB */
  mem_available_kb: number;
  /** Total amount of Swap in KB */
  swap_total_kb: number;
  /** Amount of available Swap in KB */
  swap_available_kb: number;
  /** Base64 encoded PNG screenshot of the VGA console */
  screendump_png_base64: string;
}

/**
 * Union type for getLiveServiceInfo response.
 * The actual response depends on the hypervisor type (vm_type).
 */
type GetLiveServiceInfoResponse =
  | GetLiveServiceInfoOVZResponse
  | GetLiveServiceInfoKVMResponse;

// ============================================================================
// OS Management
// ============================================================================

/**
 * POST /v1/getAvailableOS
 * Returns the currently installed OS and a list of available OS templates.
 */
interface GetAvailableOSRequest extends KiwiVMBaseRequest {}

interface GetAvailableOSResponse extends KiwiVMBaseResponse {
  /** Currently installed Operating System identifier */
  installed: string;
  /** Array of available OS template identifiers */
  templates: string[];
}

/**
 * POST /v1/reinstallOS
 * Reinstalls the Operating System.
 * The OS must be specified via the "os" parameter.
 * Use getAvailableOS to get the list of available systems.
 */
interface ReinstallOSRequest extends KiwiVMBaseRequest {
  /** OS template identifier (use getAvailableOS to get valid values) */
  os: string;
}

interface ReinstallOSResponse extends KiwiVMBaseResponse {
  /** New root password after reinstall */
  rootPassword: string;
  /** SSH port of the VPS */
  sshPort: number;
  /** SSH keys uploaded to /root/.ssh/authorized_keys */
  sshKeys: string[];
  /** SSH keys shortened for visual presentation */
  sshKeysBrief: string[];
  /** E-mail address where notification will be sent when complete */
  notificationEmail: string;
}

// ============================================================================
// SSH Key Management
// ============================================================================

/**
 * POST /v1/updateSshKeys
 * Updates per-VM SSH keys in the Hypervisor Vault.
 * Keys will be written to /root/.ssh/authorized_keys during a reinstallOS call.
 * These keys will override any keys set in the Billing Portal.
 */
interface UpdateSshKeysRequest extends KiwiVMBaseRequest {
  /** SSH public keys (one per line or as an array) */
  ssh_keys: string;
}

interface UpdateSshKeysResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/getSshKeys
 * Retrieves SSH keys stored in the Hypervisor Vault (per-VM) and the Billing Portal (per-account).
 */
interface GetSshKeysRequest extends KiwiVMBaseRequest {}

interface GetSshKeysResponse extends KiwiVMBaseResponse {
  /** Per-VM SSH keys stored in the Hypervisor Vault */
  ssh_keys_veid: string[];
  /** Per-Account SSH keys stored in the Billing Portal */
  ssh_keys_user: string[];
  /**
   * SSH keys which will be actually used during a reinstallOS call.
   * Per-VM keys will always override Per-Account keys.
   */
  ssh_keys_preferred: string[];
  /** Visually shortened per-VM keys */
  shortened_ssh_keys_veid: string[];
  /** Visually shortened per-account keys */
  shortened_ssh_keys_user: string[];
  /** Visually shortened preferred keys */
  shortened_ssh_keys_preferred: string[];
}

// ============================================================================
// Root Password
// ============================================================================

/**
 * POST /v1/resetRootPassword
 * Generates and sets a new root password for the VPS.
 */
interface ResetRootPasswordRequest extends KiwiVMBaseRequest {}

interface ResetRootPasswordResponse extends KiwiVMBaseResponse {
  /** Newly generated root password */
  password: string;
}

// ============================================================================
// Usage & Statistics
// ============================================================================

/**
 * POST /v1/getUsageGraphs
 * @deprecated Obsolete. Use getRawUsageStats instead.
 */
interface GetUsageGraphsRequest extends KiwiVMBaseRequest {}
interface GetUsageGraphsResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/getRawUsageStats
 * Returns a two-dimensional array with detailed usage statistics
 * as shown under "Detailed Statistics" in KiwiVM.
 */
interface GetRawUsageStatsRequest extends KiwiVMBaseRequest {}

interface GetRawUsageStatsResponse extends KiwiVMBaseResponse {
  /**
   * Two-dimensional array of usage statistics data points.
   * Each inner array typically contains [timestamp, value] pairs.
   */
  [key: string]: unknown;
}

// ============================================================================
// Audit Log
// ============================================================================

/**
 * POST /v1/getAuditLog
 * Returns an array with the detailed audit log as shown under "Audit Log" in KiwiVM.
 */
interface GetAuditLogRequest extends KiwiVMBaseRequest {}

interface AuditLogEntry {
  /** UNIX timestamp of the audit event */
  timestamp: number;
  /** Description of the action performed */
  description: string;
  /** Additional details about the event */
  [key: string]: unknown;
}

interface GetAuditLogResponse extends KiwiVMBaseResponse {
  /** Array of audit log entries */
  [key: string]: AuditLogEntry[] | number | string | undefined;
}

// ============================================================================
// Hostname & DNS
// ============================================================================

/**
 * POST /v1/setHostname
 * Sets a new hostname for the VPS.
 */
interface SetHostnameRequest extends KiwiVMBaseRequest {
  /** New hostname to set (e.g. "my.server.com") */
  newHostname: string;
}

interface SetHostnameResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/setPTR
 * Sets a new PTR (rDNS) record for an IP address.
 */
interface SetPTRRequest extends KiwiVMBaseRequest {
  /** IP address to set the PTR record for (e.g. "11.22.33.44") */
  ip: string;
  /** PTR record value (e.g. "ns1.my.server.com") */
  ptr: string;
}

interface SetPTRResponse extends KiwiVMBaseResponse {}

// ============================================================================
// ISO Management
// ============================================================================

/**
 * POST /v1/iso/mount
 * Mounts an ISO image for the VM to boot from.
 * The VM must be completely shut down and restarted after this API call.
 */
interface IsoMountRequest extends KiwiVMBaseRequest {
  /** ISO image identifier to mount (use getAvailableOS to see available ISOs) */
  iso: string;
}

interface IsoMountResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/iso/unmount
 * Removes the mounted ISO image and configures the VM to boot from primary storage.
 * The VM must be completely shut down and restarted after this API call.
 */
interface IsoUnmountRequest extends KiwiVMBaseRequest {}

interface IsoUnmountResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Basic Shell (Remote Command Execution)
// ============================================================================

/**
 * POST /v1/basicShell/cd
 * Simulates a "change directory" operation inside the VPS.
 * Can be used to build a shell-like "Basic Shell" interface.
 */
interface BasicShellCdRequest extends KiwiVMBaseRequest {
  /** Current working directory before the change */
  currentDir: string;
  /** New directory to change to */
  newDir: string;
}

interface BasicShellCdResponse extends KiwiVMBaseResponse {
  /** Result of the "pwd" command after the directory change */
  pwd: string;
}

/**
 * POST /v1/basicShell/exec
 * Executes a shell command on the VPS synchronously.
 * The response includes the exit status and console output.
 */
interface BasicShellExecRequest extends KiwiVMBaseRequest {
  /** Shell command to execute (e.g. "ls -la", "df -h") */
  command: string;
}

interface BasicShellExecResponse extends KiwiVMBaseResponse {
  /**
   * Exit status code of the executed command.
   * Note: when the command succeeds, this field is used for the exit code (0 = success).
   * The top-level `error` field indicates API-level errors.
   */
  message: string;
}

/**
 * POST /v1/shellScript/exec
 * Executes a shell script on the VPS asynchronously.
 * Returns the name of the output log file for later retrieval.
 */
interface ShellScriptExecRequest extends KiwiVMBaseRequest {
  /** Shell script content to execute */
  script: string;
}

interface ShellScriptExecResponse extends KiwiVMBaseResponse {
  /** Name of the output log file where script output will be written */
  log: string;
}

// ============================================================================
// Snapshot Management
// ============================================================================

/**
 * POST /v1/snapshot/create
 * Creates a snapshot of the current VPS state.
 */
interface SnapshotCreateRequest extends KiwiVMBaseRequest {
  /** Optional description for the snapshot */
  description?: string;
}

interface SnapshotCreateResponse extends KiwiVMBaseResponse {
  /** E-mail address where notification will be sent once the task is completed */
  notificationEmail: string;
}

/**
 * POST /v1/snapshot/list
 * Returns a list of all snapshots for the VPS.
 */
interface SnapshotListRequest extends KiwiVMBaseRequest {}

/**
 * Snapshot entry in the snapshot list.
 */
interface SnapshotInfo {
  /** File name / identifier of the snapshot (used for delete/restore/toggleSticky) */
  fileName: string;
  /** OS identifier at the time of the snapshot */
  os: string;
  /** User-provided description */
  description: string;
  /** Size of the snapshot in bytes */
  size: number;
  /** MD5 checksum of the snapshot */
  md5: string;
  /** Whether the snapshot is marked as sticky (1 = sticky, 0 = not sticky) */
  sticky: 0 | 1;
  /** Seconds remaining until automatic purge (null or 0 for sticky snapshots) */
  purgesIn: number | null;
  /** HTTP download link for the snapshot */
  downloadLink: string;
  /** HTTPS download link for the snapshot */
  downloadLinkSSL: string;
}

interface SnapshotListResponse extends KiwiVMBaseResponse {
  /** Array of snapshots */
  snapshots: SnapshotInfo[];
}

/**
 * POST /v1/snapshot/delete
 * Deletes a snapshot identified by its fileName.
 * Use snapshot/list to retrieve the fileName.
 */
interface SnapshotDeleteRequest extends KiwiVMBaseRequest {
  /** Snapshot fileName (retrieved from snapshot/list) */
  snapshot: string;
}

interface SnapshotDeleteResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/snapshot/restore
 * Restores a snapshot identified by its fileName.
 * WARNING: This will overwrite all data on the VPS.
 * Use snapshot/list to retrieve the fileName.
 */
interface SnapshotRestoreRequest extends KiwiVMBaseRequest {
  /** Snapshot fileName (retrieved from snapshot/list) */
  snapshot: string;
}

interface SnapshotRestoreResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/snapshot/toggleSticky
 * Sets or removes the "sticky" attribute on a snapshot.
 * "Sticky" snapshots are never automatically purged.
 */
interface SnapshotToggleStickyRequest extends KiwiVMBaseRequest {
  /** Snapshot fileName (retrieved from snapshot/list, look for the fileName variable) */
  snapshot: string;
  /** Set to 1 to enable sticky, 0 to remove sticky */
  sticky: 0 | 1;
}

interface SnapshotToggleStickyResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/snapshot/export
 * Generates a transfer token for exporting a snapshot to another instance.
 * Use the returned token together with snapshot/import on the target instance.
 */
interface SnapshotExportRequest extends KiwiVMBaseRequest {
  /** Snapshot fileName to export */
  snapshot: string;
}

interface SnapshotExportResponse extends KiwiVMBaseResponse {
  /** Token for transferring the snapshot to another instance */
  token: string;
}

/**
 * POST /v1/snapshot/import
 * Imports a snapshot from another instance identified by sourceVeid and sourceToken.
 * Both VEID and Token must be obtained from the source instance via snapshot/export beforehand.
 */
interface SnapshotImportRequest extends KiwiVMBaseRequest {
  /** Source VPS instance ID */
  sourceVeid: number;
  /** Transfer token obtained from snapshot/export on the source instance */
  sourceToken: string;
}

interface SnapshotImportResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Backup Management
// ============================================================================

/**
 * POST /v1/backup/list
 * Returns a list of automatic backups.
 */
interface BackupListRequest extends KiwiVMBaseRequest {}

/**
 * Backup entry in the backup list.
 */
interface BackupInfo {
  /** Unique token identifying the backup (used for backup/copyToSnapshot) */
  backupToken: string;
  /** Size of the backup in bytes */
  size: number;
  /** OS identifier at the time of the backup */
  os: string;
  /** MD5 checksum of the backup */
  md5: string;
  /** UNIX timestamp when the backup was created */
  timestamp: number;
}

interface BackupListResponse extends KiwiVMBaseResponse {
  /** Array of backups */
  backups: BackupInfo[];
}

/**
 * POST /v1/backup/copyToSnapshot
 * Copies a backup (identified by backupToken) into a restorable Snapshot.
 * Use backup/list to obtain the backupToken.
 */
interface BackupCopyToSnapshotRequest extends KiwiVMBaseRequest {
  /** Backup token (returned by backup/list) */
  backupToken: string;
}

interface BackupCopyToSnapshotResponse extends KiwiVMBaseResponse {}

// ============================================================================
// IPv6 Management
// ============================================================================

/**
 * POST /v1/ipv6/add
 * Assigns a new IPv6 /64 subnet to the VPS.
 */
interface Ipv6AddRequest extends KiwiVMBaseRequest {}

interface Ipv6AddResponse extends KiwiVMBaseResponse {
  /** Newly assigned IPv6 /64 subnet */
  assigned_subnet: string;
}

/**
 * POST /v1/ipv6/delete
 * Releases (removes) a specified IPv6 /64 subnet from the VPS.
 */
interface Ipv6DeleteRequest extends KiwiVMBaseRequest {
  /** IPv6 /64 subnet to release (e.g. "2001:db8::/64") */
  ip: string;
}

interface Ipv6DeleteResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Migration
// ============================================================================

/**
 * POST /v1/migrate/getLocations
 * Returns all possible datacenter migration locations for the VPS.
 */
interface MigrateGetLocationsRequest extends KiwiVMBaseRequest {}

interface MigrateGetLocationsResponse extends KiwiVMBaseResponse {
  /** ID of the current datacenter location */
  currentLocation: string;
  /** IDs of locations available for migration */
  locations: string[];
  /** Human-friendly descriptions of available locations */
  descriptions: Record<string, string>;
  /**
   * Monthly data transfer allowance multipliers for each location.
   * Some locations may offer more expensive bandwidth where monthly allowance will be lower.
   * Key: location ID, Value: multiplier (e.g. 1.0 = standard, 0.5 = half allowance)
   */
  dataTransferMultipliers: Record<string, number>;
}

/**
 * POST /v1/migrate/start
 * Starts VPS migration to a new datacenter location.
 * WARNING: This will result in all IPv4 addresses being replaced.
 */
interface MigrateStartRequest extends KiwiVMBaseRequest {
  /** Target location ID (obtained from migrate/getLocations) */
  location: string;
}

interface MigrateStartResponse extends KiwiVMBaseResponse {
  /** E-mail address where notification will be sent once the task is completed */
  notificationEmail: string;
  /** Array of new IP addresses assigned to the VPS after migration */
  newIps: string[];
}

// ============================================================================
// Server Cloning
// ============================================================================

/**
 * POST /v1/cloneFromExternalServer
 * Clones a remote server or VPS into this instance (OVZ only).
 * See "Migrate from another server" for details on how this works.
 */
interface CloneFromExternalServerRequest extends KiwiVMBaseRequest {
  /** IP address of the external server to clone from */
  externalServerIP: string;
  /** SSH port of the external server */
  externalServerSSHport: number;
  /** Root password of the external server */
  externalServerRootPassword: string;
}

interface CloneFromExternalServerResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Suspension & Policy Violations
// ============================================================================

/**
 * POST /v1/getSuspensionDetails
 * Retrieves information related to service suspensions,
 * including abuse points and detailed suspension records.
 */
interface GetSuspensionDetailsRequest extends KiwiVMBaseRequest {}

/**
 * Individual suspension record.
 */
interface SuspensionRecord {
  /** Case ID, needed to unsuspend the service via the "unsuspend" API call */
  record_id: number;
  /** Type of abuse (e.g. "copyright", "spam", "phishing") */
  flag: string;
  /**
   * Whether this can be resolved via API.
   * 0 = must contact support to unsuspend
   * 1 = can unsuspend via API call
   */
  is_soft: 0 | 1;
  /** Detailed abuse report ID (referenced in the evidence object) */
  evidence_record_id: number;
  /**
   * Abuse points added by this incident.
   * Each abuse incident increases the total_abuse_points counter.
   */
  abuse_points: number;
}

interface GetSuspensionDetailsResponse extends KiwiVMBaseResponse {
  /** Number of times the service was suspended in the current calendar year */
  suspension_count: number;
  /** Total abuse points accumulated in the current calendar year */
  total_abuse_points: number;
  /** Maximum abuse points allowed by the plan in a calendar year */
  max_abuse_points: number;
  /** Array of all outstanding suspension issues */
  suspensions: SuspensionRecord[];
  /**
   * Full text of complaints or detailed evidence.
   * Key: evidence_record_id, Value: full text of the complaint
   */
  evidence: Record<string, string>;
}

/**
 * POST /v1/getPolicyViolations
 * Retrieves information about active policy violations.
 * These must be resolved to avoid service suspension.
 */
interface GetPolicyViolationsRequest extends KiwiVMBaseRequest {}

/**
 * Individual policy violation record.
 */
interface PolicyViolationRecord {
  /** Case ID, used for resolvePolicyViolation */
  record_id: number;
  /** UNIX timestamp when the violation record was created */
  timestamp: number;
  /** UNIX timestamp by which the violation must be resolved or service will be suspended */
  suspend_at: number;
  /** Type of abuse (e.g. "copyright", "spam") */
  flag: string;
  /**
   * Whether this can be resolved via API.
   * 0 = must contact support
   * 1 = can resolve via API call
   */
  is_soft: 0 | 1;
  /** Abuse points added by this violation */
  abuse_points: number;
  /** Details of the violation (text description) */
  evidence_data: string;
}

interface GetPolicyViolationsResponse extends KiwiVMBaseResponse {
  /** Total abuse points accumulated in the current calendar year */
  total_abuse_points: number;
  /** Maximum abuse points allowed by the plan in a calendar year */
  max_abuse_points: number;
  /** Array of all outstanding policy violations */
  policy_violations: PolicyViolationRecord[];
}

/**
 * POST /v1/unsuspend
 * Clears an abuse issue identified by record_id and unsuspends the VPS.
 * Refer to getSuspensionDetails for the record_id.
 */
interface UnsuspendRequest extends KiwiVMBaseRequest {
  /** Case ID from getSuspensionDetails (the record_id field) */
  record_id: number;
}

interface UnsuspendResponse extends KiwiVMBaseResponse {}

/**
 * POST /v1/resolvePolicyViolation
 * Marks a policy violation as resolved.
 * This is required to avoid service suspension.
 * Refer to getPolicyViolations for the record_id.
 */
interface ResolvePolicyViolationRequest extends KiwiVMBaseRequest {
  /** Case ID from getPolicyViolations (the record_id field) */
  record_id: number;
}

interface ResolvePolicyViolationResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * POST /v1/getRateLimitStatus
 * Monitors API rate limit status.
 * When too many API calls are made in a short time, the API may start dropping requests for a few minutes.
 */
interface GetRateLimitStatusRequest extends KiwiVMBaseRequest {}

interface GetRateLimitStatusResponse extends KiwiVMBaseResponse {
  /** Number of "points" available to use in the current 15-minute interval */
  remaining_points_15min: number;
  /** Number of "points" available to use in the current 24-hour interval */
  remaining_points_24h: number;
}

// ============================================================================
// Private IP Management
// ============================================================================

/**
 * POST /v1/privateIp/getAvailableIps
 * Returns all available (free) IPv4 addresses which can be activated on the VM.
 */
interface PrivateIpGetAvailableIpsRequest extends KiwiVMBaseRequest {}

interface PrivateIpGetAvailableIpsResponse extends KiwiVMBaseResponse {
  /** Array of available private IP addresses */
  available_ips: string[];
}

/**
 * POST /v1/privateIp/assign
 * Assigns a private IP address to the VM.
 * If no IP is specified, a random available address will be assigned.
 */
interface PrivateIpAssignRequest extends KiwiVMBaseRequest {
  /** Optional: specific IP address to assign. If omitted, a random address will be assigned. */
  ip?: string;
}

interface PrivateIpAssignResponse extends KiwiVMBaseResponse {
  /** Array of successfully assigned private IP addresses */
  assigned_ips: string[];
}

/**
 * POST /v1/privateIp/delete
 * Removes (deletes) a private IP address from the VM.
 */
interface PrivateIpDeleteRequest extends KiwiVMBaseRequest {
  /** Private IP address to delete */
  ip: string;
}

interface PrivateIpDeleteResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Notification Preferences
// ============================================================================

/**
 * POST /v1/kiwivm/getNotificationPreferences
 * Returns all available notification settings and their current state.
 */
interface GetNotificationPreferencesRequest extends KiwiVMBaseRequest {}

interface GetNotificationPreferencesResponse extends KiwiVMBaseResponse {
  /**
   * Array of available notifications and their current state.
   * Each entry maps a preference_id to its enabled state (0 = disabled, 1 = enabled).
   */
  email_preferences: Record<string, 0 | 1>;
  /** Currently configured e-mail address where notifications are sent */
  notificationEmail: string;
}

/**
 * POST /v1/kiwivm/setNotificationPreferences
 * Changes notification preferences.
 * Accepts a JSON-formatted object mapping preference_id to 0 (disabled) or 1 (enabled).
 */
interface SetNotificationPreferencesRequest extends KiwiVMBaseRequest {
  /**
   * JSON-formatted object mapping preference_id to enabled state.
   * Example: { "1": 1, "2": 0, "3": 1 }
   * Where key is the preference_id and value is 0 (disable) or 1 (enable).
   */
  json_notification_preferences: string;
}

interface SetNotificationPreferencesResponse extends KiwiVMBaseResponse {
  /** Array of submitted notification preference changes */
  submitted_email_preferences: Record<string, 0 | 1>;
  /** Array of actually changed preferences (only those that differed from current state) */
  updated_email_preferences: Record<string, 0 | 1>;
  /** Human-friendly descriptions of all notification preferences */
  friendly_descriptions: Record<string, string>;
}

// ============================================================================
// API Endpoint Map (for type-safe routing)
// ============================================================================

/**
 * Maps API endpoint paths to their request and response types.
 * Useful for building a type-safe API client.
 */
interface KiwiVMApiEndpointMap {
  // VPS Lifecycle
  start: { request: StartRequest; response: StartResponse };
  stop: { request: StopRequest; response: StopResponse };
  restart: { request: RestartRequest; response: RestartResponse };
  kill: { request: KillRequest; response: KillResponse };

  // Service Information
  getServiceInfo: { request: GetServiceInfoRequest; response: GetServiceInfoResponse };
  getLiveServiceInfo: { request: GetLiveServiceInfoRequest; response: GetLiveServiceInfoResponse };

  // OS Management
  getAvailableOS: { request: GetAvailableOSRequest; response: GetAvailableOSResponse };
  reinstallOS: { request: ReinstallOSRequest; response: ReinstallOSResponse };

  // SSH Key Management
  updateSshKeys: { request: UpdateSshKeysRequest; response: UpdateSshKeysResponse };
  getSshKeys: { request: GetSshKeysRequest; response: GetSshKeysResponse };

  // Root Password
  resetRootPassword: { request: ResetRootPasswordRequest; response: ResetRootPasswordResponse };

  // Usage & Statistics
  getUsageGraphs: { request: GetUsageGraphsRequest; response: GetUsageGraphsResponse };
  getRawUsageStats: { request: GetRawUsageStatsRequest; response: GetRawUsageStatsResponse };

  // Audit Log
  getAuditLog: { request: GetAuditLogRequest; response: GetAuditLogResponse };

  // Hostname & DNS
  setHostname: { request: SetHostnameRequest; response: SetHostnameResponse };
  setPTR: { request: SetPTRRequest; response: SetPTRResponse };

  // ISO Management
  "iso/mount": { request: IsoMountRequest; response: IsoMountResponse };
  "iso/unmount": { request: IsoUnmountRequest; response: IsoUnmountResponse };

  // Basic Shell
  "basicShell/cd": { request: BasicShellCdRequest; response: BasicShellCdResponse };
  "basicShell/exec": { request: BasicShellExecRequest; response: BasicShellExecResponse };
  "shellScript/exec": { request: ShellScriptExecRequest; response: ShellScriptExecResponse };

  // Snapshot Management
  "snapshot/create": { request: SnapshotCreateRequest; response: SnapshotCreateResponse };
  "snapshot/list": { request: SnapshotListRequest; response: SnapshotListResponse };
  "snapshot/delete": { request: SnapshotDeleteRequest; response: SnapshotDeleteResponse };
  "snapshot/restore": { request: SnapshotRestoreRequest; response: SnapshotRestoreResponse };
  "snapshot/toggleSticky": { request: SnapshotToggleStickyRequest; response: SnapshotToggleStickyResponse };
  "snapshot/export": { request: SnapshotExportRequest; response: SnapshotExportResponse };
  "snapshot/import": { request: SnapshotImportRequest; response: SnapshotImportResponse };

  // Backup Management
  "backup/list": { request: BackupListRequest; response: BackupListResponse };
  "backup/copyToSnapshot": { request: BackupCopyToSnapshotRequest; response: BackupCopyToSnapshotResponse };

  // IPv6 Management
  "ipv6/add": { request: Ipv6AddRequest; response: Ipv6AddResponse };
  "ipv6/delete": { request: Ipv6DeleteRequest; response: Ipv6DeleteResponse };

  // Migration
  "migrate/getLocations": { request: MigrateGetLocationsRequest; response: MigrateGetLocationsResponse };
  "migrate/start": { request: MigrateStartRequest; response: MigrateStartResponse };

  // Server Cloning
  cloneFromExternalServer: { request: CloneFromExternalServerRequest; response: CloneFromExternalServerResponse };

  // Suspension & Policy Violations
  getSuspensionDetails: { request: GetSuspensionDetailsRequest; response: GetSuspensionDetailsResponse };
  getPolicyViolations: { request: GetPolicyViolationsRequest; response: GetPolicyViolationsResponse };
  unsuspend: { request: UnsuspendRequest; response: UnsuspendResponse };
  resolvePolicyViolation: { request: ResolvePolicyViolationRequest; response: ResolvePolicyViolationResponse };

  // Rate Limiting
  getRateLimitStatus: { request: GetRateLimitStatusRequest; response: GetRateLimitStatusResponse };

  // Private IP Management
  "privateIp/getAvailableIps": { request: PrivateIpGetAvailableIpsRequest; response: PrivateIpGetAvailableIpsResponse };
  "privateIp/assign": { request: PrivateIpAssignRequest; response: PrivateIpAssignResponse };
  "privateIp/delete": { request: PrivateIpDeleteRequest; response: PrivateIpDeleteResponse };

  // Notification Preferences
  "kiwivm/getNotificationPreferences": { request: GetNotificationPreferencesRequest; response: GetNotificationPreferencesResponse };
  "kiwivm/setNotificationPreferences": { request: SetNotificationPreferencesRequest; response: SetNotificationPreferencesResponse };
}

// ============================================================================
// Type-safe API Client Helper
// ============================================================================

/**
 * Type-safe API client interface.
 * Each method corresponds to a KiwiVM API endpoint and accepts the appropriate request parameters
 * (without veid/api_key, which are provided at client construction time).
 */
type KiwiVMClient = {
  [K in keyof KiwiVMApiEndpointMap]: (
    params: Omit<KiwiVMApiEndpointMap[K]["request"], "veid" | "api_key">
  ) => Promise<KiwiVMApiEndpointMap[K]["response"]>;
};
