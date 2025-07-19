import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import winston, { Logger } from 'winston';

const { createLogger, format, transports } = winston;

const gcloudStructuredLogFormat = format((info) => {
  info.severity = info.level.toUpperCase();
  // tslint:disable-next-line:no-string-literal
  delete (info as Record<string, unknown>).level;
  return info;
})();

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    gcloudStructuredLogFormat,
    format.json()
  ),
  transports: [new transports.Console()],
});

export function getRequestLogger(req: NextRequest): Logger {
  // Get the X-Cloud-Trace-Context header, if any, and process it
  const cloudTraceHeader = req.headers.get('x-cloud-trace-context');
  if (cloudTraceHeader) {
    // Parse the header value, which is in the form: [traceId]/[spanId];o=[sampled]
    const match = cloudTraceHeader.match(
      /^([0-9a-fA-F]+)\/([0-9a-fA-F]+);o=(\d)$/
    );

    if (match) {
      const [, traceId, spanId, sampled] = match;
      const projectId = process.env.PROJECT_ID;

      if (!projectId) {
        logger.warn('PROJECT_ID environment variable is not set');
        return logger.child({
          requestId: uuidv4(),
          traceAttempted: true,
          traceError: 'missing project ID',
        });
      }

      // Create the child logger with trace information
      return logger.child({
        'logging.googleapis.com/trace': `projects/${projectId}/traces/${traceId}`,
        'logging.googleapis.com/spanId': spanId,
        'logging.googleapis.com/trace_sampled': sampled === '1',
      });
    } else {
      // Log when header exists but regex fails to match
      logger.debug('Failed to parse Cloud Trace header', {
        header: cloudTraceHeader,
      });
      return logger.child({
        requestId: uuidv4(),
        traceAttempted: true,
        traceError: 'invalid format',
      });
    }
  }
  // If no trace header or if parsing failed, create our own requestId
  return logger.child({ requestId: uuidv4() });
}
