import { Logging } from '@google-cloud/logging';

export class GCPLogger {
  private req?: { url: string; method: string; startTime: number };
  private logging: Logging;
  private logName: string;
  private severityMap: Record<string, keyof Console> = {
    DEBUG: 'debug',
    INFO: 'info',
    WARNING: 'warn',
    ERROR: 'error',
  };

  constructor() {
    this.logging = new Logging({projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID});
    this.logName = 'nextjs-api-logs';
  }

  public setReq(req: { url: string; method: string; startTime: number }): this {
    this.req = req;
    return this;
  }

  private async logMessage(severity: string, status: number, payload: object): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const method = this.severityMap[severity] || "log";
      (console[method as keyof Console] as (...args: any[]) => void)(`[${severity}]`, payload);
      return;
    }

    if (!this.req) {
      throw new Error('Request object is not set. Call setReq() before logging.');
    }

    const {url, method, startTime} = this.req;
    const log = this.logging.log(this.logName);
    const durationMs = Date.now() - startTime;
    const metadata = {
      severity,
      httpRequest: {
        requestUrl: url,
        requestMethod: method,
        status,
        latency: { seconds: Math.floor(durationMs / 1000), nanos: (durationMs % 1000) * 1e6 }
      }
    };
    const logEntry = log.entry(metadata, payload);
    await log.write(logEntry);
  }

  async log(severity: string, status: number, payload: object): Promise<void> {
    await this.logMessage(severity, status, payload);
  }

  async debug(payload: object): Promise<void> { return this.log('DEBUG', 100, payload); }
  async info(payload: object): Promise<void> { return this.log('INFO', 200, payload); }
  async warn(payload: object): Promise<void> { return this.log('WARNING', 400, payload); }
  async error(payload: object): Promise<void> { return this.log('ERROR', 500, payload); }
}
