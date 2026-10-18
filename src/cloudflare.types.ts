/**
 * Cloudflare API 客户端配置。
 * @see https://developers.cloudflare.com/api/
 */
export interface CloudflareConfig {
  /**
   * Cloudflare API Token。
   * 推荐使用 API Token，不要使用 Global API Key。
   * 创建路径：Cloudflare Dashboard → My Profile → API Tokens。
   * 本流水线至少需要：Zone Read、Zone DNS Edit、SSL and Certificates Write。
   */
  apiToken: string;

  /**
   * Cloudflare API 基础地址。
   * 默认使用 https://api.cloudflare.com/client/v4。
   */
  baseUrl?: string;
}

/**
 * 创建 Zone（添加域名）的请求参数。
 * @see POST /zones
 */
export interface CreateZoneParams {
  /**
   * 要添加的域名，例如 example.com。
   * 必须是根域名，不能是子域名。
   */
  name: string;

  /**
   * Cloudflare 账户 ID。
   * 可在域名 Overview 页面底部获取。
   */
  accountId: string;

  /**
   * 是否立即扫描并导入现有 DNS 记录。
   * 首次接入时建议设为 true。
   */
  jumpStart?: boolean;

  /**
   * 接入类型。
   * - full：完整 DNS 托管，需要修改 NS 记录。
   * - partial：部分 DNS 托管，通常用于 CNAME 接入。
   */
  type?: "full" | "partial";
}

/**
 * Zone 信息。
 * @see GET /zones/{zone_id}
 */
export interface Zone {
  /** Zone 唯一标识，后续 DNS、SSL 接口都需要使用。 */
  id: string;

  /** 域名名称，例如 example.com。 */
  name: string;

  /**
   * Zone 状态。
   * 常见值：
   * - pending_nameserver_update：等待修改 NS 记录。
   * - active：已激活。
   * - deactivated：已停用。
   */
  status: string;

  /**
   * Cloudflare 分配的 Nameserver 列表。
   * 需要到域名注册商处将 NS 记录改为这两个值。
   */
  nameServers: string[];
}

/**
 * 创建 DNS 记录的请求参数。
 * @see POST /zones/{zone_id}/dns_records
 */
export interface CreateDnsRecordParams {
  /** 所属 Zone ID。 */
  zoneId: string;

  /**
   * DNS 记录类型。
   * 常见类型：A、AAAA、CNAME、MX、TXT、NS、SRV、CAA。
   */
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV" | "CAA";

  /**
   * 记录名称。
   * 根域名可写 example.com 或 @；子域名可写 www.example.com。
   */
  name: string;

  /**
   * 记录值。
   * A/AAAA 为 IP 地址；CNAME 为目标域名；MX 为邮件服务器地址。
   */
  content: string;

  /**
   * TTL，单位为秒。
   * 可设为 1 表示自动；否则通常为 120–86400。
   */
  ttl?: number;

  /**
   * 是否开启 Cloudflare 代理（橙色云朵）。
   * 开启后流量会经过 Cloudflare 边缘节点。
   * 邮件类记录通常设为 false。
   */
  proxied?: boolean;

  /**
   * MX 记录优先级。
   * 仅 MX 记录需要，数值越小优先级越高。
   */
  priority?: number;
}

/**
 * DNS 记录响应。
 * @see POST /zones/{zone_id}/dns_records
 */
export interface DnsRecord {
  /** DNS 记录唯一标识。 */
  id: string;

  /** 记录类型，例如 A、CNAME。 */
  type: string;

  /** 记录名称。 */
  name: string;

  /** 记录值。 */
  content: string;

  /** TTL，单位为秒。 */
  ttl: number;

  /** 是否开启 Cloudflare 代理。 */
  proxied: boolean;

  /** 所属 Zone ID。 */
  zoneId: string;
}

/**
 * 创建 Origin CA 证书的请求参数。
 * Origin CA 证书用于源站 Nginx/Apache，仅 Cloudflare 回源链路信任。
 * @see POST /certificates
 */
export interface CreateOriginCertificateParams {
  /**
   * 证书覆盖的域名列表。
   * 建议包含根域名和通配符域名，例如 ["example.com", "*.example.com"]。
   */
  hostnames: string[];

  /**
   * 密钥类型。
   * - origin-rsa：RSA 密钥。
   * - origin-ecc：ECC 密钥，通常性能更好。
   */
  requestType?: "origin-rsa" | "origin-ecc";

  /**
   * 证书有效期，单位为天。
   * 最长可设为 5475 天，即 15 年。
   */
  requestedValidity?: number;

  /**
   * 自定义 CSR。
   * 留空时由 Cloudflare 生成私钥和 CSR。
   * 如果留空，返回结果中的 private_key 只显示一次，必须立即保存。
   */
  csr?: string;
}

/**
 * Origin CA 证书响应。
 * @see POST /certificates
 */
export interface OriginCertificate {
  /** 证书唯一标识。 */
  id: string;

  /**
   * PEM 格式证书。
   * 部署到 Nginx 的 ssl_certificate。
   */
  certificate: string;

  /**
   * PEM 格式私钥。
   * 部署到 Nginx 的 ssl_certificate_key。
   * 仅在创建时返回一次，之后无法再次获取。
   */
  private_key: string;

  /** 证书覆盖的域名列表。 */
  hostnames: string[];

  /**
   * 证书过期时间，ISO 8601 格式。
   * Cloudflare 不会主动发送 Origin CA 证书到期通知，建议自行监控。
   */
  expiresOn: string;

  /** 密钥类型，例如 origin-rsa、origin-ecc。 */
  requestType: string;
}

/**
 * 更新 Zone SSL/TLS 加密模式的请求参数。
 * @see PATCH /zones/{zone_id}/settings/ssl
 */
export interface UpdateSslSettingParams {
  /** 所属 Zone ID。 */
  zoneId: string;

  /**
   * SSL/TLS 加密模式。
   * - off：禁用 HTTPS。
   * - flexible：仅加密浏览器到 Cloudflare。
   * - full：加密全链路，源站证书可以是自签名。
   * - strict：加密全链路，源站证书必须是受信任证书或 Origin CA 证书。
   */
  value: "off" | "flexible" | "full" | "strict";
}

/**
 * 域名接入流水线执行结果。
 */
export interface CloudflareDomainSetupResult {
  /** Zone ID。 */
  zoneId: string;

  /** 域名名称。 */
  zoneName: string;

  /** 已创建的 DNS 记录 ID 列表。 */
  dnsRecordIds: string[];

  /** Origin CA 证书 ID。 */
  certificateId: string;

  /** PEM 证书内容，用于写入 Nginx ssl_certificate。 */
  certificate: string;

  /** PEM 私钥内容，用于写入 Nginx ssl_certificate_key。 */
  privateKey: string;

  /** 证书过期时间。 */
  expiresOn: string;

  /** 当前 Zone 的 SSL/TLS 加密模式。 */
  sslMode: string;
}
