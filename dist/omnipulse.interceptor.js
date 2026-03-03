"use strict";
// ─────────────────────────────────────────────
// @omnipulse/nestjs — HTTP Request Tracing Interceptor
// Automatically traces every HTTP request
// ─────────────────────────────────────────────
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmniPulseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
const types_1 = require("./types");
const transport_1 = require("./transport");
let OmniPulseInterceptor = class OmniPulseInterceptor {
    constructor(config, transport) {
        this.config = config;
        this.transport = transport;
        this.serviceName = config.serviceName || 'nestjs-app';
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const startTime = Date.now();
        const traceId = request.headers['x-trace-id'] || (0, crypto_1.randomUUID)();
        const spanId = (0, crypto_1.randomUUID)();
        // Attach trace context to request for downstream use
        request.__omnipulse_trace_id = traceId;
        request.__omnipulse_span_id = spanId;
        request.__omnipulse_start_time = startTime;
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                this.recordSpan(request, context, startTime, traceId, spanId, 'ok');
            },
            error: (error) => {
                this.recordSpan(request, context, startTime, traceId, spanId, 'error', error);
            },
        }));
    }
    recordSpan(request, context, startTime, traceId, spanId, status, error) {
        try {
            const endTime = Date.now();
            const durationMs = endTime - startTime;
            const response = context.switchToHttp().getResponse();
            const handler = context.getHandler();
            const controllerClass = context.getClass();
            const span = {
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
                console.log(`[OmniPulse] ${request.method} ${request.url} → ${response.statusCode} (${durationMs}ms)`);
            }
        }
        catch {
            // Silent — SDK must never crash
        }
    }
};
exports.OmniPulseInterceptor = OmniPulseInterceptor;
exports.OmniPulseInterceptor = OmniPulseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(types_1.OMNIPULSE_CONFIG)),
    __param(1, (0, common_1.Inject)('OMNIPULSE_TRANSPORT')),
    __metadata("design:paramtypes", [Object, transport_1.Transport])
], OmniPulseInterceptor);
//# sourceMappingURL=omnipulse.interceptor.js.map