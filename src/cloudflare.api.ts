import {
  CloudflareConfig,
  CreateZoneParams,
  Zone,
  CreateDnsRecordParams,
  DnsRecord,
  CreateOriginCertificateParams,
  OriginCertificate,
  UpdateSslSettingParams,
} from "./cloudflare.types";

export class CloudflareApi {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(config: CloudflareConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl ?? "https://api.cloudflare.com/client/v4";
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    const body = (await response.json()) as {
      success: boolean;
      result: T;
      errors?: Array<{ code: number; message: string }>;
    };

    if (!body.success) {
      const error = body.errors?.[0];
      throw new Error(
        `Cloudflare API error: ${error?.message ?? "unknown error"}`
      );
    }

    return body.result;
  }

  /**
   * POST /zones
   */
  async createZone(params: CreateZoneParams): Promise<Zone> {
    return this.request<Zone>("/zones", {
      method: "POST",
      body: JSON.stringify({
        name: params.name,
        account: { id: params.accountId },
        jump_start: params.jumpStart ?? false,
        type: params.type ?? "full",
      }),
    });
  }

  /**
   * POST /zones/{zone_id}/dns_records
   */
  async createDnsRecord(params: CreateDnsRecordParams): Promise<DnsRecord> {
    return this.request<DnsRecord>(
      `/zones/${params.zoneId}/dns_records`,
      {
        method: "POST",
        body: JSON.stringify({
          type: params.type,
          name: params.name,
          content: params.content,
          ttl: params.ttl ?? 1,
          proxied: params.proxied ?? true,
          priority: params.priority,
        }),
      }
    );
  }

  /**
   * POST /certificates
   */
  async createOriginCertificate(
    params: CreateOriginCertificateParams
  ): Promise<OriginCertificate> {
    return this.request<OriginCertificate>("/certificates", {
      method: "POST",
      body: JSON.stringify({
        hostnames: params.hostnames,
        request_type: params.requestType ?? "origin-rsa",
        requested_validity: params.requestedValidity ?? 5475,
        csr: params.csr ?? "",
      }),
    });
  }

  /**
   * PATCH /zones/{zone_id}/settings/ssl
   */
  async updateSslSetting(params: UpdateSslSettingParams): Promise<{
    id: string;
    value: string;
  }> {
    return this.request<{ id: string; value: string }>(
      `/zones/${params.zoneId}/settings/ssl`,
      {
        method: "PATCH",
        body: JSON.stringify({ value: params.value }),
      }
    );
  }
}
