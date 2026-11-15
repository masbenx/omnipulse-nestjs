import { describe, it, expect } from 'vitest';
import { Transport } from './transport';

describe('NestJS Transport', () => {
    it('queues and stops cleanly without crashing when offline', () => {
        const transport = new Transport({
            apiKey: 'test-key',
            endpoint: 'http://127.0.0.1:1',
            serviceName: 'nest-api',
            environment: 'test',
            flushIntervalMs: 60000,
        });

        transport.addLog({
            timestamp: '2026-11-15T00:00:00Z',
            level: 'info',
            message: 'nest log',
            service: 'nest-api',
        });
        transport.stop();
        expect(transport).toBeDefined();
    });
});
