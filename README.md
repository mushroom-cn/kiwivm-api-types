# kiwivm-api-types

TypeScript types and axios-based client for [BandwagonHost (搬瓦工) KiwiVM REST API](https://bandwagonhost.com/kiwivm-wiki-REST-API).

## Features

- **Typed axios client** — `KiwiVMClient` class with full TypeScript support for all 40+ API endpoints
- **Detailed JSDoc** — every type, interface, field, and method documented
- **Auto error handling** — `KiwiVMApiError` thrown on non-zero API error codes, with response interceptor
- **Type exports** — all request/response types exported for building higher-level abstractions

## Installation

```bash
npm install github:mushroom-cn/kiwivm-api-types
```

> Note: requires `axios` as a peer dependency (included automatically).

## Quick Start

```ts
import { KiwiVMClient } from "kiwivm-api-types";

const client = new KiwiVMClient({
  veid: 671428,
  apiKey: "YOUR_API_KEY",
});

// Start the VPS
await client.start();

// Get service info
const info = await client.getServiceInfo();
console.log(info.hostname);     // "my.server.com"
console.log(info.plan_ram);     // 155189248 (bytes)
console.log(info.ip_addresses); // ["1.2.3.4"]

// Create a snapshot
await client.snapshotCreate({ description: "Before upgrade" });

// List snapshots
const { snapshots } = await client.snapshotList();
for (const s of snapshots) {
  console.log(s.fileName, s.description, s.size);
}

// Set PTR record
await client.setPTR({ ip: "1.2.3.4", ptr: "ns1.my.server.com" });

// Reinstall OS
const available = await client.getAvailableOS();
await client.reinstallOS({ os: available.templates[0] });
```

## Client Options

```ts
new KiwiVMClient({
  veid: 671428,           // required — VPS instance ID
  apiKey: "YOUR_KEY",     // required — API key
  baseURL: "https://...", // optional — API base URL (default: https://api.64clouds.com/v1)
  timeout: 30000,         // optional — request timeout in ms (default: 30000)
});
```

## Error Handling

The client throws `KiwiVMApiError` when the API returns a non-zero error code:

```ts
import { KiwiVMClient, KiwiVMApiError } from "kiwivm-api-types";

try {
  await client.restart();
} catch (err) {
  if (err instanceof KiwiVMApiError) {
    console.error(`API error ${err.errorCode}: ${err.message}`);
    console.error(`Endpoint: ${err.endpoint}`);
  }
}
```

## Available Methods

| Category | Methods |
|----------|---------|
| **VPS Lifecycle** | `start()`, `stop()`, `restart()`, `kill()` |
| **Service Info** | `getServiceInfo()`, `getLiveServiceInfo()` |
| **OS** | `getAvailableOS()`, `reinstallOS({ os })` |
| **SSH Keys** | `updateSshKeys({ ssh_keys })`, `getSshKeys()` |
| **Password** | `resetRootPassword()` |
| **Statistics** | `getUsageGraphs()`, `getRawUsageStats()`, `getAuditLog()` |
| **Hostname/DNS** | `setHostname({ newHostname })`, `setPTR({ ip, ptr })` |
| **ISO** | `isoMount({ iso })`, `isoUnmount()` |
| **Shell** | `basicShellCd({ currentDir, newDir })`, `basicShellExec({ command })`, `shellScriptExec({ script })` |
| **Snapshots** | `snapshotCreate({ description? })`, `snapshotList()`, `snapshotDelete({ snapshot })`, `snapshotRestore({ snapshot })`, `snapshotToggleSticky({ snapshot, sticky })`, `snapshotExport({ snapshot })`, `snapshotImport({ sourceVeid, sourceToken })` |
| **Backups** | `backupList()`, `backupCopyToSnapshot({ backupToken })` |
| **IPv6** | `ipv6Add()`, `ipv6Delete({ ip })` |
| **Migration** | `migrateGetLocations()`, `migrateStart({ location })` |
| **Cloning** | `cloneFromExternalServer({ externalServerIP, externalServerSSHport, externalServerRootPassword })` |
| **Suspensions** | `getSuspensionDetails()`, `getPolicyViolations()`, `unsuspend({ record_id })`, `resolvePolicyViolation({ record_id })` |
| **Rate Limit** | `getRateLimitStatus()` |
| **Private IP** | `privateIpGetAvailableIps()`, `privateIpAssign({ ip? })`, `privateIpDelete({ ip })` |
| **Notifications** | `getNotificationPreferences()`, `setNotificationPreferences({ json_notification_preferences })` |

## Project Structure

```
src/
├── index.ts      — barrel export (client + all types)
├── client.ts     — KiwiVMClient class (axios-based)
└── types.ts      — all TypeScript type definitions
```

## Build

```bash
npm run build   # compiles to dist/
```

## License

MIT
