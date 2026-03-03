import { OnModuleDestroy } from '@nestjs/common';
import { Transport } from './transport';
import { OmniPulseConfig, TestResult } from './types';
import { OmniPulseLogger } from './omnipulse.logger';
export declare class OmniPulseService implements OnModuleDestroy {
    readonly transport: Transport;
    readonly logger: OmniPulseLogger;
    private readonly config;
    constructor(config: OmniPulseConfig);
    captureError(error: Error, meta?: Record<string, any>): void;
    test(): Promise<TestResult>;
    version(): string;
    getConfig(): Record<string, string>;
    onModuleDestroy(): void;
}
