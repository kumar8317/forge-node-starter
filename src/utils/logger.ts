import log4js from 'log4js';

export default function getLogger(loggerName?: string): log4js.Logger {
    const logger = log4js.getLogger(loggerName);
    logger.level = 'debug';
    return logger;
}
