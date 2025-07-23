'use client';

import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function FrontendObservability() {
  if (faro.api) {
    return null;
  }

  try {
    initializeFaro({
      url: 'http://localhost:12347/collect',
      apiKey: 'secret',
      app: {
        name: 'dinners/frontend/web',
        namespace: 'dinners/frontend',
        version: '0.0.0',
      },
      instrumentations: [
        ...getWebInstrumentations(),
        new TracingInstrumentation(),
      ],
      trackResources: true,
      batching: {
        enabled: true,
      },
    });
  } catch {
    return null;
  }
  return null;
}
