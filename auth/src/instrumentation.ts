import FastifyOtelInstrumentation from '@fastify/otel';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from "@opentelemetry/core";
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

export const fastifyOtelInstrumentation = new FastifyOtelInstrumentation()

export const sdk = new NodeSDK({
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
    }),
    spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
    logRecordProcessors: [
        new BatchLogRecordProcessor(new OTLPLogExporter())
    ],
    instrumentations: [
        getNodeAutoInstrumentations(),
        fastifyOtelInstrumentation,
        new PinoInstrumentation({
            logKeys: {
                spanId: 'span_id',
                traceId: 'trace_id',
                traceFlags: 'trace_flags'
            },
        })
    ],
    textMapPropagator: new CompositePropagator({
        propagators: [
            new W3CTraceContextPropagator(),
            new W3CBaggagePropagator(),
        ]
    })
});

