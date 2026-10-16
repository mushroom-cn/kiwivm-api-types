# kiwivm-api-types

TypeScript type declarations for [BandwagonHost (搬瓦工) KiwiVM REST API](https://bandwagonhost.com/kiwivm-wiki-REST-API).

## Features

- Complete type coverage for all 40+ KiwiVM API endpoints
- Detailed JSDoc comments for every type, interface, and field
- Type-safe API endpoint map (`KiwiVMApiEndpointMap`) for building robust clients
- Request/Response type pairs for each endpoint
- Helper `KiwiVMClient` type for building type-safe API wrappers

## Installation

```bash
npm install github:mushroom-cn/kiwivm-api-types
```

## Usage

```typescript
/// <reference types="kiwivm-api-types" />

// Use the types directly
const request: GetServiceInfoRequest = {
  veid: 671428,
  api_key: "YOUR_API_KEY",
};

// Or use the endpoint map for type-safe routing
type StartEndpoint = KiwiVMApiEndpointMap["start"];
// StartEndpoint.request → StartRequest
// StartEndpoint.response → StartResponse
```

## Covered Endpoints

| Category | Endpoints |
|----------|-----------|
| VPS Lifecycle | `start`, `stop`, `restart`, `kill` |
| Service Info | `getServiceInfo`, `getLiveServiceInfo` |
| OS Management | `getAvailableOS`, `reinstallOS` |
| SSH Keys | `updateSshKeys`, `getSshKeys` |
| Password | `resetRootPassword` |
| Statistics | `getUsageGraphs`, `getRawUsageStats`, `getAuditLog` |
| Hostname/DNS | `setHostname`, `setPTR` |
| ISO | `iso/mount`, `iso/unmount` |
| Shell | `basicShell/cd`, `basicShell/exec`, `shellScript/exec` |
| Snapshots | `snapshot/create`, `snapshot/list`, `snapshot/delete`, `snapshot/restore`, `snapshot/toggleSticky`, `snapshot/export`, `snapshot/import` |
| Backups | `backup/list`, `backup/copyToSnapshot` |
| IPv6 | `ipv6/add`, `ipv6/delete` |
| Migration | `migrate/getLocations`, `migrate/start` |
| Cloning | `cloneFromExternalServer` |
| Suspensions | `getSuspensionDetails`, `getPolicyViolations`, `unsuspend`, `resolvePolicyViolation` |
| Rate Limits | `getRateLimitStatus` |
| Private IP | `privateIp/getAvailableIps`, `privateIp/assign`, `privateIp/delete` |
| Notifications | `kiwivm/getNotificationPreferences`, `kiwivm/setNotificationPreferences` |

## License

MIT
