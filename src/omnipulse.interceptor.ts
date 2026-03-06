// ─────────────────────────────────────────────
// @omnipulse/nestjs — HTTP Request Tracing Interceptor
// Automatically traces every HTTP request
// ─────────────────────────────────────────────

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { randomUUID } from 'crypto';
import { OmniPulseConfig, SpanEntry, RequestEntry, OMNIPULSE_CONFIG } from './types';
import { Transport } from './transport';

@Injectable()
export class OmniPulseInterceptor implements NestInterceptor {
    private transport: Transport;
    private serviceName: string;
    private environment: string;

    constructor(
        @Inject(OMNIPULSE_CONFIG) private config: OmniPulseConfig,
        @Inject('OMNIPULSE_TRANSPORT') transport: Transport,
    ) {
        this.transport = transport;
        this.serviceName = config.serviceName || 'nestjs-app';
        this.environment = config.environment || 'production';
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const startTime = Date.now();
        const traceId = request.headers['x-trace-id'] || randomUUID();
        const spanId = randomUUID();

        // Attach trace context to request for downstream use
        request.__omnipulse_trace_id = traceId;
        request.__omnipulse_span_id = spanId;
        request.__omnipulse_start_time = startTime;

        return next.handle().pipe(
            tap({
                next: () => {
                    this.recordRequest(request, context, startTime, traceId, spanId, 'ok');
                },
                error: (error) => {
                    this.recordRequest(request, context, startTime, traceId, spanId, 'error', error);
                },
            }),
        );
    }

    private recordRequest(
        request: any,
        context: ExecutionContext,
        startTime: number,
        traceId: string,
        spanId: string,
        status: 'ok' | 'error',
        error?: any,
    ): void {
        try {
            const endTime = Date.now();
            const durationMs = endTime - startTime;
            const response = context.switchToHttp().getResponse();
            const handler = context.getHandler();
            const controllerClass = context.getClass();

            // 1) Send trace span (for Traces tab)
            const span: SpanEntry = {
                trace_id: traceId,
                span_id: spanId,
                name: `${request.method} ${request.route?.path || request.url}`,
                start_ts: new Date(startTime).toISOString(),
                duration_ms: durationMs,
                status: status,
                service: this.serviceName,
                kind: 'server',
                attributes: {
                    'http.method': request.method,
                    'http.url': request.url,
                    'http.route': request.route?.path || request.url,
                    'http.status_code': response.statusCode,
                    'http.user_agent': request.headers?.['user-agent'],
                    'http.client_ip': request.ip || request.connection?.remoteAddress,
                    'nestjs.controller': controllerClass?.name,
                    'nestjs.handler': handler?.name,
                },
                env: this.environment,
            };
            this.transport.addSpan(span);

            // 2) Send request event (for Overview dashboard: 24h Requests, Avg Latency, Success Rate)
            const requestEntry: RequestEntry = {
                timestamp: new Date(startTime).toISOString(),
                method: request.method,
                route: request.route?.path || request.url,
                status: response.statusCode,
                duration_ms: durationMs,
                env: this.environment,
                trace_id: traceId,
            };
            this.transport.addRequest(requestEntry);

            if (this.config.debug) {
                console.log(
                    `[OmniPulse] ${request.method} ${request.url} → ${response.statusCode} (${durationMs}ms)`,
                );
            }
        } catch {
            // Silent — SDK must never crash
        }
    }
}
