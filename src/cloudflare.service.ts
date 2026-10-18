import { CloudflareApi } from "./cloudflare.api";
import {
  CloudflareConfig,
  CloudflareDomainSetupResult,
} from "./cloudflare.types";

export interface SetupDomainParams {
  domain: string;
  accountId: string;
  originIp: string;
  certificateHostnames?: string[];
  sslMode?: "strict" | "full";
}

export async function setupCloudflareDomain(
  config: CloudflareConfig,
  params: SetupDomainParams
): Promise<CloudflareDomainSetupResult> {
  const api = new CloudflareApi(config);

  const zone = await api.createZone({
    name: params.domain,
    accountId: params.accountId,
    jumpStart: true,
    type: "full",
  });

  const dnsRecord = await api.createDnsRecord({
    zoneId: zone.id,
    type: "A",
    name: params.domain,
    content: params.originIp,
    proxied: true,
  });

  const certificateHostnames =
    params.certificateHostnames ?? [params.domain, `*.${params.domain}`];

  const certificate = await api.createOriginCertificate({
    hostnames: certificateHostnames,
    requestType: "origin-rsa",
    requestedValidity: 5475,
  });

  const ssl = await api.updateSslSetting({
    zoneId: zone.id,
    value: params.sslMode ?? "strict",
  });

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    dnsRecordIds: [dnsRecord.id],
    certificateId: certificate.id,
    certificate: certificate.certificate,
    privateKey: certificate.private_key,
    expiresOn: certificate.expiresOn,
    sslMode: ssl.value,
  };
}
