export interface CloudflareConfig {
  apiToken: string;
  baseUrl?: string;
}

export interface CreateZoneParams {
  name: string;
  accountId: string;
  jumpStart?: boolean;
  type?: "full" | "partial";
}

export interface Zone {
  id: string;
  name: string;
  status: string;
  nameServers: string[];
}

export interface CreateDnsRecordParams {
  zoneId: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV" | "CAA";
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
  priority?: number;
}

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  zoneId: string;
}

export interface CreateOriginCertificateParams {
  hostnames: string[];
  requestType?: "origin-rsa" | "origin-ecc";
  requestedValidity?: number;
  csr?: string;
}

export interface OriginCertificate {
  id: string;
  certificate: string;
  private_key: string;
  hostnames: string[];
  expiresOn: string;
  requestType: string;
}

export interface UpdateSslSettingParams {
  zoneId: string;
  value: "off" | "flexible" | "full" | "strict";
}

export interface CloudflareDomainSetupResult {
  zoneId: string;
  zoneName: string;
  dnsRecordIds: string[];
  certificateId: string;
  certificate: string;
  privateKey: string;
  expiresOn: string;
  sslMode: string;
}
