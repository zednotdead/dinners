import FastifyOtelInstrumentation from '@fastify/otel';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from "@opentelemetry/core";
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

export const fastifyOtelInstrumentation = new FastifyOtelInstrumentation()

const sdk = new NodeSDK({
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
    }),
    spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
    logRecordProcessors: [
        new SimpleLogRecordProcessor(new OTLPLogExporter())
    ],
    instrumentations: [
      getNodeAutoInstrumentations(),
      fastifyOtelInstrumentation,
      new WinstonInstrumentation({})
    ],
    textMapPropagator: new CompositePropagator({
        propagators: [
            new W3CTraceContextPropagator(),
            new W3CBaggagePropagator(),
        ]
    })
});

sdk.start()
