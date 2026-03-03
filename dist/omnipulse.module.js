"use strict";
// ─────────────────────────────────────────────
// @omnipulse/nestjs — NestJS Dynamic Module
// OmniPulseModule.forRoot(config)
// ─────────────────────────────────────────────
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OmniPulseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmniPulseModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const types_1 = require("./types");
const transport_1 = require("./transport");
const omnipulse_service_1 = require("./omnipulse.service");
const omnipulse_interceptor_1 = require("./omnipulse.interceptor");
const omnipulse_filter_1 = require("./omnipulse.filter");
const omnipulse_middleware_1 = require("./omnipulse.middleware");
let OmniPulseModule = OmniPulseModule_1 = class OmniPulseModule {
    /**
     * Register OmniPulseModule globally with configuration.
     *
     * @example
     * ```typescript
     * // app.module.ts
     * import { OmniPulseModule } from '@omnipulse/nestjs';
     *
     * @Module({
     *   imports: [
     *     OmniPulseModule.forRoot({
     *       apiKey: process.env.OMNIPULSE_INGEST_KEY,
     *       serviceName: 'my-nestjs-api',
     *       endpoint: 'https://api.omnipulse.cloud',
     *       environment: process.env.NODE_ENV || 'production',
     *     }),
     *   ],
     * })
     * export class AppModule {}
     * ```
     */
    static forRoot(config) {
        const transport = new transport_1.Transport(config);
        return {
            module: OmniPulseModule_1,
            providers: [
                {
                    provide: types_1.OMNIPULSE_CONFIG,
                    useValue: config,
                },
                {
                    provide: 'OMNIPULSE_TRANSPORT',
                    useValue: transport,
                },
                omnipulse_service_1.OmniPulseService,
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: omnipulse_interceptor_1.OmniPulseInterceptor,
                },
                {
                    provide: core_1.APP_FILTER,
                    useClass: omnipulse_filter_1.OmniPulseExceptionFilter,
                },
            ],
            exports: [omnipulse_service_1.OmniPulseService, types_1.OMNIPULSE_CONFIG, 'OMNIPULSE_TRANSPORT'],
        };
    }
    configure(consumer) {
        consumer.apply(omnipulse_middleware_1.OmniPulseMiddleware).forRoutes('*');
    }
};
exports.OmniPulseModule = OmniPulseModule;
exports.OmniPulseModule = OmniPulseModule = OmniPulseModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], OmniPulseModule);
//# sourceMappingURL=omnipulse.module.js.map