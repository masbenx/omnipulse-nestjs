// ─────────────────────────────────────────────
// @omnipulse/nestjs — Injectable Service
// Central client singleton via NestJS DI
// ─────────────────────────────────────────────

import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Transport } from './transport';
import { OmniPulseConfig, TestResult, OMNIPULSE_CONFIG } from './types';
import { OmniPulseLogger } from './omnipulse.logger';

const SDK_VERSION = '0.1.0';

@Injectable()
export class OmniPulseService implements OnModuleDestroy {
    public readonly transport: Transport;
    public readonly logger: OmniPulseLogger;
    private readonly config: OmniPulseConfig;

    constructor(@Inject(OMNIPULSE_CONFIG) config: OmniPulseConfig) {
        this.config = config;
        this.transport = new Transport(config);
        this.logger = new OmniPulseLogger(this.transport, config.serviceName);

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
    public captureError(error: Error, meta?: Record<string, any>): void {
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
    public async test(): Promise<TestResult> {
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
        } catch (err: any) {
            return {
                success: false,
                message: 'Connection test exception: ' + (err?.message || String(err)),
            };
        }
    }

    /**
     * Get SDK version.
     */
    public version(): string {
        return `v${SDK_VERSION}`;
    }

    /**
     * Get current configuration (API key redacted).
     */
    public getConfig(): Record<string, string> {
        return {
            endpoint: this.config.endpoint ?? 'https://api.omnipulse.cloud',
            serviceName: this.config.serviceName ?? 'nestjs-app',
            apiKey: this.config.apiKey ? '[REDACTED]' : 'not set',
            environment: this.config.environment ?? 'production',
        };
    }

    onModuleDestroy(): void {
        this.transport.stop();
    }
}
