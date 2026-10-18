// otel.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";

export const sdk = new NodeSDK({
  instrumentations: [
    new PinoInstrumentation({
      // 自动把当前 span 的 trace_id、span_id 注入到 Pino 日志里
      disableLogCorrelation: false,
    }),
  ],
  logRecordProcessor: new SimpleLogRecordProcessor(
    new OTLPLogExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/logs",
    })
  ),
});

sdk.start();
