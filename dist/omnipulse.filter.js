"use strict";
// ─────────────────────────────────────────────
// @omnipulse/nestjs — Exception Filter
// Automatic unhandled exception capture
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
exports.OmniPulseExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const types_1 = require("./types");
const transport_1 = require("./transport");
let OmniPulseExceptionFilter = class OmniPulseExceptionFilter {
    constructor(config, transport) {
        this.transport = transport;
        this.serviceName = config.serviceName || 'nestjs-app';
        this.debug = config.debug || false;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        // Determine status code
        const statusCode = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        // Only capture 5xx errors (server errors) and unexpected exceptions
        // 4xx errors are typically client errors and should not be treated as bugs
        const shouldCapture = statusCode >= 500 || !(exception instanceof common_1.HttpException);
        if (shouldCapture) {
            try {
                const error = exception instanceof Error ? exception : new Error(String(exception));
                const traceId = request.__omnipulse_trace_id;
                const requestId = request.__omnipulse_span_id;
                const entry = {
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
            }
            catch {
                // Silent — SDK must never crash
            }
        }
        // Re-throw for NestJS default exception handling
        // Let NestJS handle the response
        const errorResponse = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : {
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        response.status(statusCode).json(typeof errorResponse === 'string'
            ? { statusCode, message: errorResponse }
            : errorResponse);
    }
};
exports.OmniPulseExceptionFilter = OmniPulseExceptionFilter;
exports.OmniPulseExceptionFilter = OmniPulseExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __param(0, (0, common_1.Inject)(types_1.OMNIPULSE_CONFIG)),
    __param(1, (0, common_1.Inject)('OMNIPULSE_TRANSPORT')),
    __metadata("design:paramtypes", [Object, transport_1.Transport])
], OmniPulseExceptionFilter);
//# sourceMappingURL=omnipulse.filter.js.map