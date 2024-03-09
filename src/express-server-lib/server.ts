import express, { Express, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { Server } from 'http';
import { Logger } from 'log4js';
import * as CustomLogger from '../utils/logger';
import {
    enableCOEP, enableCors,
    enableCSP, enableDPC,  enableHPB, enableHSTS, enableIeNoOpen,
    enableNoSniff, enableOAC,
    enableXssFilter, globalRateLimit, localRateLimit,
} from './middleware';
import {
    Options, RateLimitOptions, Route, Routing,
} from './declarations';
import { sendDataResponse, handleErrorResponse, SERVICE_UNAVAILABLE_STATUS_CODE } from './responseHandler';

export class ServerApp {
    private readonly serverName: string = 'Server';

    private logger: Logger;

    private router: Express;

    private server: Server | null = null;

    private readonly port: number = 5000;

    private globalRateLimitEnabled: boolean;

    private globalRateLimitOptions: RateLimitOptions = {
        windowMs: 1 * 1000, // 1 second
        max: 10, // Limit each IP to 10 requests per `window` (here, per 1 second)
        standardHeaders: false,
        legacyHeaders: false,
    };

    private selfMonitor: boolean = false;

    constructor(options: Options) {
        this.router = express();

        // Setting up the server PORT and NAME
        if (options && options.port) this.port = options.port;
        if (options && options.serverName) this.serverName = options.serverName;
        this.logger = CustomLogger.default(this.serverName.toUpperCase());
        this.logger.info(`${this.serverName} Details :-`);

        /**
         * Middlewares
         */

        this.router.use(express.json());
        if (options.enableFileUpload) this.router.use(fileUpload({ createParentPath: true }));

        // Global rate limit
        this.globalRateLimitEnabled = options.enableGlobalRateLimiter;
        if (options.enableGlobalRateLimiter) {
            if (options.globalRateLimiterOptions) {
                this.globalRateLimitOptions = options.globalRateLimiterOptions;
            }
            this.logger.info(`Rate limit enabled on each route, ${this.globalRateLimitOptions.max} hits per ${this.globalRateLimitOptions.windowMs} milliseconds.`);
        } else {
            this.logger.info('Global rate limiting is disabled');
        }

        // Enable cors
        if (!options.cors || !options.cors?.disable) {
            if (options.cors?.options) {
                enableCors(this.router, options.cors.options);
            } else {
                enableCors(this.router);
            }
        }

        // Security Middlewares
        if (!options.securityHeaders || !options.securityHeaders.disableAll) {
            if (!options.securityHeaders?.contentSecurityPolicy?.disable) {
                if (options.securityHeaders?.contentSecurityPolicy?.options) {
                    enableCSP(this.router, options.securityHeaders.contentSecurityPolicy.options);
                } else {
                    enableCSP(this.router);
                }
            }
            if (!options.securityHeaders?.removeCrossOriginEmbedderPolicy) {
                enableCOEP(this.router);
            }
            
            if (!options.securityHeaders?.strictTransportSecurity?.disable) {
                if (options.securityHeaders?.strictTransportSecurity?.options) {
                    enableHSTS(
                        this.router, options.securityHeaders.strictTransportSecurity.options,
                    );
                } else {
                    enableHSTS(this.router);
                }
            }
            if (!options.securityHeaders?.removeNoSniff) {
                enableNoSniff(this.router);
            }
            if (!options.securityHeaders?.removeOriginAgentCluster) {
                enableOAC(this.router);
            }
            if (!options.securityHeaders?.dnsPrefetchControl?.disable) {
                if (options.securityHeaders?.dnsPrefetchControl?.options) {
                    enableDPC(this.router, options.securityHeaders.dnsPrefetchControl.options);
                } else {
                    enableDPC(this.router);
                }
            }
            if (!options.securityHeaders?.removeIeNoOpen) {
                enableIeNoOpen(this.router);
            }
            if (!options.securityHeaders?.removeHidePoweredBy) {
                enableHPB(this.router);
            }
            if (!options.securityHeaders?.removeXSSFilter) {
                enableXssFilter(this.router);
            }
        }
        this.logger.info(`End of ${this.serverName} Details`);

        // Health Check Route
        if (options.healthCheck && options.healthCheck.disable) {
            this.logger.warn(`Health check route is disabled on server: ${this.serverName}`);
        } else {
            let routePath = '/health'; // default route
            if (options.healthCheck && typeof options.healthCheck.routePath === 'string') {
                if (options.healthCheck.routePath.startsWith('/')) {
                    routePath = options.healthCheck.routePath;
                } else {
                    routePath = `/${options.healthCheck.routePath}`;
                }
            }

            this.router.get(routePath, (req: Request, res: Response) => {
                try {
                    return sendDataResponse({
                        version: process.env.npm_package_version,
                        date: new Date(),
                    }, res);
                } catch (error) {
                    this.logger.error('Health check error', error);
                    return handleErrorResponse({
                        status: SERVICE_UNAVAILABLE_STATUS_CODE,
                        message: 'Service Unavailable',
                    }, res);
                }
            });
            this.logger.info(`Added health check route ${routePath} on server: ${this.serverName}`);
        }
    }

    /**
     * Initializes the server on the specified port
     */
    public initalise(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.router.listen(this.port, () => {
                    this.logger.info(`${this.serverName} started on port : ${this.port}`.toUpperCase());
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Closes the running server
     */
    public closeServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((err) => {
                    if (err) {
                        this.logger.error(`Error while closing the server: ${this.serverName}`, err);
                        reject(err);
                    } else {
                        this.logger.info(`${this.serverName} closed on port : ${this.port}`.toUpperCase());
                        resolve();
                    }
                });
            } else {
                this.logger.error('Cannot close because server is not initialized');
                resolve();
            }
        });
    }

    /**
     * Returns the express object
     */
    public get expressApp(): Express {
        return this.router;
    }

    /**
     * Returns the http server object
     */
    public get httpServer(): Server {
        if (this.server) return this.server;
        throw new Error('Cannot get server instance as it is not initialized');
    }

    /**
     * Create routes for application using Express Router
     * @param routeUrl Parent route URL for child routes
     * @param routing Routing object or a route object
     * @param router Express router object
     */
    applyRoutes = (routeUrl: string, routing: Routing | Route): void => {
        switch (routing.isRoute) {
            case false:
                // eslint-disable-next-line no-param-reassign
                routing.url = routeUrl + (routing.url === '/' ? '' : routing.url);
                routing.childRoutes.forEach((childRoute) => {
                    this.applyRoutes(routing.url, childRoute);
                });
                break;
            case true:
                // eslint-disable-next-line no-param-reassign
                routing.path = routeUrl + routing.path;
                const {
                    method, path, handlers, rateLimit, disableGlobalRateLimit,
                } = routing;
                // If selfMonitor is enabled then use metrics middleware
                const handlersList = this.selfMonitor ? [ ...handlers] : handlers;
                if (this.globalRateLimitEnabled) {
                    if (disableGlobalRateLimit) {
                        if (rateLimit) {
                            this.router[method](
                                path,
                                localRateLimit(rateLimit, path, this.logger),
                                handlersList,
                            );
                        } else this.router[method](path, handlersList);
                    } else {
                        if (rateLimit) this.logger.warn(`Cannot apply rate limit on path-'${path}' as global rate limit is not disabled on the path.`);
                        this.router[method](
                            path,
                            globalRateLimit(this.globalRateLimitOptions),
                            handlersList,
                        );
                    }
                } else if (rateLimit) {
                    this.router[method](
                        path,
                        localRateLimit(rateLimit, path, this.logger),
                        handlersList,
                    );
                } else this.router[method](path, handlersList);
                break;
            default:
        }
    };
}

export default ServerApp;