import { OnModuleDestroy } from '@nestjs/common';
import { Transport } from './transport';
import { OmniPulseConfig, TestResult } from './types';
import { OmniPulseLogger } from './omnipulse.logger';
export declare class OmniPulseService implements OnModuleDestroy {
    readonly transport: Transport;
    readonly logger: OmniPulseLogger;
    private readonly config;
    constructor(config: OmniPulseConfig);
    /**
     * Manually capture an error and send to OmniPulse.
     */
    captureError(error: Error, meta?: Record<string, any>): void;
    /**
     * Test connection to OmniPulse backend.
     */
    test(): Promise<TestResult>;
    /**
     * Get SDK version.
     */
    version(): string;
    /**
     * Get current configuration (API key redacted).
     */
    getConfig(): Record<string, string>;
    onModuleDestroy(): void;
}
//# sourceMappingURL=omnipulse.service.d.ts.map