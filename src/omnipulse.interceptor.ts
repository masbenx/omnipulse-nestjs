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
import { OmniPulseConfig, SpanEntry, OMNIPULSE_CONFIG } from './types';
import { Transport } from './transport';

@Injectable()
export class OmniPulseInterceptor implements NestInterceptor {
    private transport: Transport;
    private serviceName: string;

    constructor(
        @Inject(OMNIPULSE_CONFIG) private config: OmniPulseConfig,
        @Inject('OMNIPULSE_TRANSPORT') transport: Transport,
    ) {
        this.transport = transport;
        this.serviceName = config.serviceName || 'nestjs-app';
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
                    this.recordSpan(request, context, startTime, traceId, spanId, 'ok');
                },
                error: (error) => {
                    this.recordSpan(request, context, startTime, traceId, spanId, 'error', error);
                },
            }),
        );
    }

    private recordSpan(
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

            const span: SpanEntry = {
                trace_id: traceId,
                span_id: spanId,
                name: `${request.method} ${request.route?.path || request.url}`,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                duration_ms: durationMs,
                status_code: status,
                status_message: error?.message,
                attributes: {
                    'http.method': request.method,
                    'http.url': request.url,
                    'http.route': request.route?.path || request.url,
                    'http.status_code': response.statusCode,
                    'http.user_agent': request.headers?.['user-agent'],
                    'http.client_ip': request.ip || request.connection?.remoteAddress,
                    'nestjs.controller': controllerClass?.name,
                    'nestjs.handler': handler?.name,
                    'service': this.serviceName,
                },
            };

            this.transport.addSpan(span);

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
