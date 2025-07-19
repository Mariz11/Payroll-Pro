import winston, { Logger } from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export class LoggerService {
  protected logger: Logger;

  constructor(private readonly name: string, loggerInstance?: Logger) {
    this.logger = loggerInstance || logger;
  }
}