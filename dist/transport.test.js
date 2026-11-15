"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const transport_1 = require("./transport");
(0, vitest_1.describe)('NestJS Transport', () => {
    (0, vitest_1.it)('queues and stops cleanly without crashing when offline', () => {
        const transport = new transport_1.Transport({
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
        (0, vitest_1.expect)(transport).toBeDefined();
    });
});
//# sourceMappingURL=transport.test.js.map