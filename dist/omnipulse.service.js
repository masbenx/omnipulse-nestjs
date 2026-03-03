"use strict";
// ─────────────────────────────────────────────
// @omnipulse/nestjs — Injectable Service
// Central client singleton via NestJS DI
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
exports.OmniPulseService = void 0;
const common_1 = require("@nestjs/common");
const transport_1 = require("./transport");
const types_1 = require("./types");
const omnipulse_logger_1 = require("./omnipulse.logger");
const SDK_VERSION = '0.1.0';
let OmniPulseService = class OmniPulseService {
    constructor(config) {
        this.config = config;
        this.transport = new transport_1.Transport(config);
        this.logger = new omnipulse_logger_1.OmniPulseLogger(this.transport, config.serviceName);
        if (config.debug) {
            console.log('[OmniPulse] NestJS SDK initialized', {
                endpoint: config.endpoint || 'https://api.omnipulse.cloud',
                serviceName: config.serviceName || 'nestjs-app',
                environment: config.environment || 'production',
            });
        }
    }
    /**
     * Manually capture an error and send to OmniPulse.
     */
    captureError(error, meta) {
        this.transport.addError({
            type: error.name || 'Error',
            message: error.message || 'Unknown error',
            stack: error.stack,
            timestamp: new Date().toISOString(),
            service: this.config.serviceName || 'nestjs-app',
            meta,
        });
    }
    /**
     * Test connection to OmniPulse backend.
     */
    async test() {
        if (!this.config.apiKey) {
            return {
                success: false,
                message: 'No API key configured. Set "apiKey" in config.',
            };
        }
        try {
            const result = await this.transport.testConnection();
            return {
                success: result.success,
                message: result.success
                    ? 'Connection successful! Test log sent.'
                    : `Connection failed (HTTP ${result.httpCode})`,
                httpCode: result.httpCode,
                response: result.response,
            };
        }
        catch (err) {
            return {
                success: false,
                message: 'Connection test exception: ' + (err?.message || String(err)),
            };
        }
    }
    /**
     * Get SDK version.
     */
    version() {
        return `v${SDK_VERSION}`;
    }
    /**
     * Get current configuration (API key redacted).
     */
    getConfig() {
        return {
            endpoint: this.config.endpoint ?? 'https://api.omnipulse.cloud',
            serviceName: this.config.serviceName ?? 'nestjs-app',
            apiKey: this.config.apiKey ? '[REDACTED]' : 'not set',
            environment: this.config.environment ?? 'production',
        };
    }
    onModuleDestroy() {
        this.transport.stop();
    }
};
exports.OmniPulseService = OmniPulseService;
exports.OmniPulseService = OmniPulseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(types_1.OMNIPULSE_CONFIG)),
    __metadata("design:paramtypes", [Object])
], OmniPulseService);
//# sourceMappingURL=omnipulse.service.js.map