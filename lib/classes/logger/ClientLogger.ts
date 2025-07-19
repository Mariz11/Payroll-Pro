export default class ClientLogger {
  private async log(severity: string, payload: object) {
    if (process.env.NODE_ENV === 'development') {
      (console[severity.toLowerCase() as keyof Console] as (...args: any[]) => void)(`[${severity}]`, payload || {});
      return;
    }

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity: severity.toLowerCase(), payload }),
      });
    } catch (error) {
      console.error('[Client Log Error]', error);
    }
  }

  public debug(payload: object) {
    this.log('DEBUG', payload);
  }

  public info(payload: object) {
    this.log('INFO', payload);
  }

  public warn(payload: object) {
    this.log('WARN', payload);
  }

  public error(payload: object) {
    this.log('ERROR', payload);
  }
}
