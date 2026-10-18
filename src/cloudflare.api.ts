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

  /**
   * 通用请求方法。
   * 所有请求都会携带 Authorization: Bearer <apiToken> 和 Content-Type: application/json。
   * 如果 Cloudflare 返回 success=false，会抛出 Error。
   */
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
   * 创建 Zone，即把域名接入 Cloudflare。
   * @see POST /zones
   * @param params 创建 Zone 参数
   * @returns Zone 信息，包含 zoneId、域名状态和分配的 Nameserver
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
   * 为指定 Zone 创建 DNS 记录。
   * @see POST /zones/{zone_id}/dns_records
   * @param params DNS 记录参数
   * @returns 创建后的 DNS 记录
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
   * 创建 Cloudflare Origin CA 证书。
   * 该证书用于源站 Nginx/Apache，仅 Cloudflare 回源链路信任。
   * 如果 csr 为空，Cloudflare 会生成私钥；private_key 仅在创建时返回一次。
   * @see POST /certificates
   * @param params 证书创建参数
   * @returns Origin CA 证书，包含 certificate、private_key、expiresOn
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
   * 更新 Zone 的 SSL/TLS 加密模式。
   * 使用 Origin CA 证书时，通常应设为 strict。
   * @see PATCH /zones/{zone_id}/settings/ssl
   * @param params SSL 设置参数
   * @returns 更新后的 SSL 设置
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
