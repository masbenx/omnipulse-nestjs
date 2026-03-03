// ─────────────────────────────────────────────
// @omnipulse/nestjs — Exception Filter
// Automatic unhandled exception capture
// ─────────────────────────────────────────────

import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import { OmniPulseConfig, ErrorEntry, OMNIPULSE_CONFIG } from './types';
import { Transport } from './transport';

@Catch()
export class OmniPulseExceptionFilter implements ExceptionFilter {
    private transport: Transport;
    private serviceName: string;
    private debug: boolean;

    constructor(
        @Inject(OMNIPULSE_CONFIG) config: OmniPulseConfig,
        @Inject('OMNIPULSE_TRANSPORT') transport: Transport,
    ) {
        this.transport = transport;
        this.serviceName = config.serviceName || 'nestjs-app';
        this.debug = config.debug || false;
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        // Determine status code
        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Only capture 5xx errors (server errors) and unexpected exceptions
        // 4xx errors are typically client errors and should not be treated as bugs
        const shouldCapture = statusCode >= 500 || !(exception instanceof HttpException);

        if (shouldCapture) {
            try {
                const error = exception instanceof Error ? exception : new Error(String(exception));
                const traceId = request.__omnipulse_trace_id;
                const requestId = request.__omnipulse_span_id;

                const entry: ErrorEntry = {
                    type: error.name || 'UnhandledException',
                    message: error.message || 'Unknown error',
                    stack: error.stack,
                    url: request.url,
                    method: request.method,
                    status_code: statusCode,
                    timestamp: new Date().toISOString(),
                    service: this.serviceName,
                    trace_id: traceId,
                    request_id: requestId,
                    meta: {
                        headers: {
                            'user-agent': request.headers?.['user-agent'],
                            'content-type': request.headers?.['content-type'],
                        },
                        ip: request.ip || request.connection?.remoteAddress,
                        params: request.params,
                        query: request.query,
                    },
                };

                this.transport.addError(entry);

                if (this.debug) {
                    console.error(`[OmniPulse] Captured exception: ${error.message}`);
                }
            } catch {
                // Silent — SDK must never crash
            }
        }

        // Re-throw for NestJS default exception handling
        // Let NestJS handle the response
        const errorResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                };

        response.status(statusCode).json(
            typeof errorResponse === 'string'
                ? { statusCode, message: errorResponse }
                : errorResponse,
        );
    }
}
