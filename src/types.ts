/**
 * BandwagonHost (搬瓦工) KiwiVM REST API - TypeScript Types
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
// Enums
// ============================================================================

/**
 * Hypervisor (虚拟化) 类型。
 * Returned by `getServiceInfo` in the `vm_type` field.
 */
export enum HypervisorType {
  /** OpenVZ 虚拟化 */
  OpenVZ = "ovz",
  /** KVM 虚拟化 */
  KVM = "kvm",
}

/**
 * VPS 运行状态。
 * Returned by `getLiveServiceInfo` in the `ve_status` field (KVM only).
 */
export enum VmStatus {
  /** VPS 正在启动 */
  Starting = "Starting",
  /** VPS 正在运行 */
  Running = "Running",
  /** VPS 已停止 */
  Stopped = "Stopped",
}

/**
 * 布尔标志位 (0/1)，用于 API 中表示 true/false 的数值字段。
 *
 * Used in:
 * - `rdns_api_available`, `plan_private_network_available`, `location_private_network_available`
 * - `suspended`, `policy_violation`
 * - `is_cpu_throttled`, `is_disk_throttled`
 * - `sticky` (snapshot)
 * - `is_soft` (suspension / policy violation)
 * - `email_preferences` (notification preference)
 */
export enum BoolFlag {
  /** 否 / 关闭 / 不可用 */
  False = 0,
  /** 是 / 开启 / 可用 */
  True = 1,
}

/**
 * 滥用投诉类型。
 * Returned in `flag` field of SuspensionRecord and PolicyViolationRecord.
 *
 * Note: This is not an exhaustive list. The API may return additional values
 * not covered here. Use the string value directly if your flag is not listed.
 */
export enum AbuseFlag {
  /** 版权侵权 */
  Copyright = "copyright",
  /** 垃圾邮件 */
  Spam = "spam",
  /** 钓鱼网站 */
  Phishing = "phishing",
  /** 恶意软件 / 病毒 */
  Malware = "malware",
  /** 网络扫描 / 端口扫描 */
  Scanning = "scanning",
  /** DDoS 攻击 */
  DDOS = "ddos",
  /** 非法内容 */
  Illegal = "illegal",
}

// ============================================================================
// Common / Base Types
// ============================================================================

/**
 * Base response returned by every KiwiVM API call.
 * If `error` is non-zero, `message` contains the error description.
 */
export interface KiwiVMBaseResponse {
  /**
   * Error code. 0 = success, non-zero = error occurred.
   * When non-zero, refer to `message` for detailed error information.
   */
  error: number;
  /** Human-readable error message (present when error is non-zero) */
  message?: string;
}

/**
 * Configuration options for the KiwiVMClient instance.
 */
export interface KiwiVMClientOptions {
  /** VPS instance ID (VEID) */
  veid: number;
  /** API key associated with the VPS instance */
  apiKey: string;
  /**
   * API base URL.
   * @default "https://api.64clouds.com/v1"
   */
  baseURL?: string;
  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;
}

// ============================================================================
// VPS Lifecycle
// ============================================================================

/** start / stop / restart / kill — no extra params */
export interface StartResponse extends KiwiVMBaseResponse {}
export interface StopResponse extends KiwiVMBaseResponse {}
export interface RestartResponse extends KiwiVMBaseResponse {}
/**
 * kill — Forcibly stops a VPS that is stuck.
 * WARNING: Any unsaved data will be lost.
 */
export interface KillResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Service Information
// ============================================================================

/**
 * Information about IP address nullrouting during (D)DoS attacks.
 */
export interface IpNullrouteInfo {
  /** UNIX timestamp when the attack started */
  nullroute_timestamp: number;
  /** Duration of the nullroute in seconds */
  nullroute_duration_s: number;
  /** Raw packet dump data of the attack (multi-line string) */
  log: string;
}

export interface GetServiceInfoResponse extends KiwiVMBaseResponse {
  /** Hypervisor type: "ovz" (OpenVZ) or "kvm" (KVM) */
  vm_type: HypervisorType;
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
   * Key is the IP address under attack.
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
  rdns_api_available: BoolFlag;
  /** Whether Private Network features are available on this plan */
  plan_private_network_available: BoolFlag;
  /** Whether Private Network features are available at this location */
  location_private_network_available: BoolFlag;
  /**
   * rDNS records. Key is the IP address, value is the PTR hostname.
   * e.g. { "1.2.3.4": "ns1.my.server.com" }
   */
  ptr: Record<string, string>;
  /** Whether the VPS is currently suspended (0 = no, 1 = yes) */
  suspended: BoolFlag;
  /** Whether there is an active policy violation that needs attention */
  policy_violation: BoolFlag;
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
 * Common fields present in getLiveServiceInfo response.
 */
export interface GetLiveServiceInfoBase extends GetServiceInfoResponse {
  /**
   * CPU throttling status.
   * 0 = not throttled, 1 = throttled (resets every 2 hours)
   */
  is_cpu_throttled: BoolFlag;
  /** SSH port of the VPS */
  ssh_port: number;
}

/** OpenVZ (OVZ) hypervisor specific fields. */
export interface GetLiveServiceInfoOVZResponse extends GetLiveServiceInfoBase {
  /** OpenVZ beancounters, load average, processes, files, sockets, memory usage */
  vz_status: Record<string, unknown>;
  /** OpenVZ disk size, inodes and usage info */
  vz_quota: Record<string, unknown>;
}

/** KVM hypervisor specific fields. */
export interface GetLiveServiceInfoKVMResponse extends GetLiveServiceInfoBase {
  /** VPS status: "Starting", "Running" or "Stopped" */
  ve_status: VmStatus;
  /** MAC address of primary network interface */
  ve_mac1: string;
  /** Occupied (mapped) disk space in bytes */
  ve_used_disk_space_b: number;
  /** Actual size of disk image in GB */
  ve_disk_quota_gb: number;
  /**
   * Disk I/O throttling status.
   * 0 = not throttled, 1 = throttled (resets every 15-180 minutes)
   */
  is_disk_throttled: BoolFlag;
  /** Result of "hostname" command inside the VPS */
  live_hostname: string;
  /** Raw load average string */
  load_average: string;
  /** Available RAM in KB */
  mem_available_kb: number;
  /** Total Swap in KB */
  swap_total_kb: number;
  /** Available Swap in KB */
  swap_available_kb: number;
  /** Base64 encoded PNG screenshot of the VGA console */
  screendump_png_base64: string;
}

/** Union type for getLiveServiceInfo response. */
export type GetLiveServiceInfoResponse =
  | GetLiveServiceInfoOVZResponse
  | GetLiveServiceInfoKVMResponse;

// ============================================================================
// OS Management
// ============================================================================

export interface GetAvailableOSResponse extends KiwiVMBaseResponse {
  /** Currently installed Operating System identifier */
  installed: string;
  /** Array of available OS template identifiers */
  templates: string[];
}

export interface ReinstallOSParams {
  /** OS template identifier (use getAvailableOS to get valid values) */
  os: string;
}

export interface ReinstallOSResponse extends KiwiVMBaseResponse {
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

export interface UpdateSshKeysParams {
  /** SSH public keys */
  ssh_keys: string;
}

export interface UpdateSshKeysResponse extends KiwiVMBaseResponse {}

export interface GetSshKeysResponse extends KiwiVMBaseResponse {
  /** Per-VM SSH keys stored in the Hypervisor Vault */
  ssh_keys_veid: string[];
  /** Per-Account SSH keys stored in the Billing Portal */
  ssh_keys_user: string[];
  /** SSH keys used during reinstallOS (Per-VM overrides Per-Account) */
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

export interface ResetRootPasswordResponse extends KiwiVMBaseResponse {
  /** Newly generated root password */
  password: string;
}

// ============================================================================
// Usage & Statistics
// ============================================================================

/** @deprecated Use getRawUsageStats instead */
export interface GetUsageGraphsResponse extends KiwiVMBaseResponse {}

export interface GetRawUsageStatsResponse extends KiwiVMBaseResponse {
  [key: string]: unknown;
}

// ============================================================================
// Audit Log
// ============================================================================

export interface AuditLogEntry {
  /** UNIX timestamp of the audit event */
  timestamp: number;
  /** Description of the action performed */
  description: string;
  [key: string]: unknown;
}

export interface GetAuditLogResponse extends KiwiVMBaseResponse {
  [key: string]: AuditLogEntry[] | number | string | undefined;
}

// ============================================================================
// Hostname & DNS
// ============================================================================

export interface SetHostnameParams {
  /** New hostname to set (e.g. "my.server.com") */
  newHostname: string;
}

export interface SetHostnameResponse extends KiwiVMBaseResponse {}

export interface SetPTRParams {
  /** IP address to set the PTR record for (e.g. "11.22.33.44") */
  ip: string;
  /** PTR record value (e.g. "ns1.my.server.com") */
  ptr: string;
}

export interface SetPTRResponse extends KiwiVMBaseResponse {}

// ============================================================================
// ISO Management
// ============================================================================

export interface IsoMountParams {
  /** ISO image identifier to mount */
  iso: string;
}

export interface IsoMountResponse extends KiwiVMBaseResponse {}
export interface IsoUnmountResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Basic Shell
// ============================================================================

export interface BasicShellCdParams {
  /** Current working directory before the change */
  currentDir: string;
  /** New directory to change to */
  newDir: string;
}

export interface BasicShellCdResponse extends KiwiVMBaseResponse {
  /** Result of the "pwd" command after the directory change */
  pwd: string;
}

export interface BasicShellExecParams {
  /** Shell command to execute */
  command: string;
}

export interface BasicShellExecResponse extends KiwiVMBaseResponse {
  /** Console output of the executed command */
  message: string;
}

export interface ShellScriptExecParams {
  /** Shell script content to execute */
  script: string;
}

export interface ShellScriptExecResponse extends KiwiVMBaseResponse {
  /** Name of the output log file */
  log: string;
}

// ============================================================================
// Snapshot Management
// ============================================================================

export interface SnapshotCreateParams {
  /** Optional description for the snapshot */
  description?: string;
}

export interface SnapshotCreateResponse extends KiwiVMBaseResponse {
  /** E-mail address where notification will be sent */
  notificationEmail: string;
}

/** Snapshot entry in the snapshot list. */
export interface SnapshotInfo {
  /** File name / identifier of the snapshot */
  fileName: string;
  /** OS identifier at the time of the snapshot */
  os: string;
  /** User-provided description */
  description: string;
  /** Size of the snapshot in bytes */
  size: number;
  /** MD5 checksum */
  md5: string;
  /** Whether the snapshot is sticky (1 = yes, 0 = no) */
  sticky: BoolFlag;
  /** Seconds remaining until automatic purge (null for sticky) */
  purgesIn: number | null;
  /** HTTP download link */
  downloadLink: string;
  /** HTTPS download link */
  downloadLinkSSL: string;
}

export interface SnapshotListResponse extends KiwiVMBaseResponse {
  /** Array of snapshots */
  snapshots: SnapshotInfo[];
}

export interface SnapshotActionParams {
  /** Snapshot fileName (retrieved from snapshot/list) */
  snapshot: string;
}

export interface SnapshotDeleteResponse extends KiwiVMBaseResponse {}
export interface SnapshotRestoreResponse extends KiwiVMBaseResponse {}

export interface SnapshotToggleStickyParams {
  /** Snapshot fileName */
  snapshot: string;
  /** 1 = set sticky, 0 = remove sticky */
  sticky: BoolFlag;
}

export interface SnapshotToggleStickyResponse extends KiwiVMBaseResponse {}

export interface SnapshotExportParams {
  /** Snapshot fileName to export */
  snapshot: string;
}

export interface SnapshotExportResponse extends KiwiVMBaseResponse {
  /** Transfer token for importing on another instance */
  token: string;
}

export interface SnapshotImportParams {
  /** Source VPS instance ID */
  sourceVeid: number;
  /** Transfer token from snapshot/export on the source */
  sourceToken: string;
}

export interface SnapshotImportResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Backup Management
// ============================================================================

/** Backup entry in the backup list. */
export interface BackupInfo {
  /** Unique token identifying the backup */
  backupToken: string;
  /** Size in bytes */
  size: number;
  /** OS identifier */
  os: string;
  /** MD5 checksum */
  md5: string;
  /** UNIX timestamp of creation */
  timestamp: number;
}

export interface BackupListResponse extends KiwiVMBaseResponse {
  backups: BackupInfo[];
}

export interface BackupCopyToSnapshotParams {
  /** Backup token (from backup/list) */
  backupToken: string;
}

export interface BackupCopyToSnapshotResponse extends KiwiVMBaseResponse {}

// ============================================================================
// IPv6 Management
// ============================================================================

export interface Ipv6AddResponse extends KiwiVMBaseResponse {
  /** Newly assigned IPv6 /64 subnet */
  assigned_subnet: string;
}

export interface Ipv6DeleteParams {
  /** IPv6 /64 subnet to release */
  ip: string;
}

export interface Ipv6DeleteResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Migration
// ============================================================================

export interface MigrateGetLocationsResponse extends KiwiVMBaseResponse {
  /** ID of current location */
  currentLocation: string;
  /** IDs of available locations */
  locations: string[];
  /** Human-friendly descriptions */
  descriptions: Record<string, string>;
  /**
   * Monthly data transfer allowance multipliers.
   * Key: location ID, Value: multiplier (1.0 = standard)
   */
  dataTransferMultipliers: Record<string, number>;
}

export interface MigrateStartParams {
  /** Target location ID */
  location: string;
}

export interface MigrateStartResponse extends KiwiVMBaseResponse {
  /** Notification e-mail */
  notificationEmail: string;
  /** New IP addresses assigned after migration */
  newIps: string[];
}

// ============================================================================
// Server Cloning (OVZ only)
// ============================================================================

export interface CloneFromExternalServerParams {
  /** IP address of the external server */
  externalServerIP: string;
  /** SSH port of the external server */
  externalServerSSHport: number;
  /** Root password of the external server */
  externalServerRootPassword: string;
}

export interface CloneFromExternalServerResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Suspension & Policy Violations
// ============================================================================

/** Individual suspension record. */
export interface SuspensionRecord {
  /** Case ID, needed for unsuspend */
  record_id: number;
  /** Type of abuse (e.g. "copyright", "spam") */
  flag: string;
  /** 0 = must contact support, 1 = can unsuspend via API */
  is_soft: BoolFlag;
  /** Detailed abuse report ID */
  evidence_record_id: number;
  /** Abuse points added by this incident */
  abuse_points: number;
}

export interface GetSuspensionDetailsResponse extends KiwiVMBaseResponse {
  /** Number of suspensions in current calendar year */
  suspension_count: number;
  /** Total abuse points in current calendar year */
  total_abuse_points: number;
  /** Max abuse points allowed by plan */
  max_abuse_points: number;
  /** Outstanding suspension records */
  suspensions: SuspensionRecord[];
  /** Full text of complaints. Key: evidence_record_id */
  evidence: Record<string, string>;
}

/** Individual policy violation record. */
export interface PolicyViolationRecord {
  /** Case ID for resolvePolicyViolation */
  record_id: number;
  /** UNIX timestamp when created */
  timestamp: number;
  /** UNIX timestamp when service will be suspended if unresolved */
  suspend_at: number;
  /** Type of abuse */
  flag: string;
  /** 0 = must contact support, 1 = can resolve via API */
  is_soft: BoolFlag;
  /** Abuse points */
  abuse_points: number;
  /** Details text */
  evidence_data: string;
}

export interface GetPolicyViolationsResponse extends KiwiVMBaseResponse {
  /** Total abuse points in current calendar year */
  total_abuse_points: number;
  /** Max abuse points allowed by plan */
  max_abuse_points: number;
  /** Outstanding policy violations */
  policy_violations: PolicyViolationRecord[];
}

export interface RecordIdParams {
  /** Case ID from getSuspensionDetails or getPolicyViolations */
  record_id: number;
}

export interface UnsuspendResponse extends KiwiVMBaseResponse {}
export interface ResolvePolicyViolationResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Rate Limiting
// ============================================================================

export interface GetRateLimitStatusResponse extends KiwiVMBaseResponse {
  /** Points remaining in the current 15-minute interval */
  remaining_points_15min: number;
  /** Points remaining in the current 24-hour interval */
  remaining_points_24h: number;
}

// ============================================================================
// Private IP Management
// ============================================================================

export interface PrivateIpGetAvailableIpsResponse extends KiwiVMBaseResponse {
  /** Array of available private IP addresses */
  available_ips: string[];
}

export interface PrivateIpAssignParams {
  /** Optional: specific IP to assign. If omitted, a random one is assigned. */
  ip?: string;
}

export interface PrivateIpAssignResponse extends KiwiVMBaseResponse {
  /** Array of successfully assigned private IPs */
  assigned_ips: string[];
}

export interface PrivateIpDeleteParams {
  /** Private IP address to delete */
  ip: string;
}

export interface PrivateIpDeleteResponse extends KiwiVMBaseResponse {}

// ============================================================================
// Notification Preferences
// ============================================================================

export interface GetNotificationPreferencesResponse extends KiwiVMBaseResponse {
  /** Map of preference_id → enabled state (0/1) */
  email_preferences: Record<string, BoolFlag>;
  /** Notification e-mail address */
  notificationEmail: string;
}

export interface SetNotificationPreferencesParams {
  /**
   * JSON string mapping preference_id to 0 (disable) or 1 (enable).
   * e.g. '{ "1": 1, "2": 0 }'
   */
  json_notification_preferences: string;
}

export interface SetNotificationPreferencesResponse extends KiwiVMBaseResponse {
  /** Submitted changes */
  submitted_email_preferences: Record<string, BoolFlag>;
  /** Actually changed preferences */
  updated_email_preferences: Record<string, BoolFlag>;
  /** Human-friendly descriptions */
  friendly_descriptions: Record<string, string>;
}
