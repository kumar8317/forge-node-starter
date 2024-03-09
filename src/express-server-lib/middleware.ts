import cors from 'cors';
import {
    NextFunction, Request, Response, Router,
} from 'express';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { Logger } from 'log4js';
import {
    contentSecurityPolicy, xssFilter,
    crossOriginEmbedderPolicy, crossOriginOpenerPolicy,
    crossOriginResourcePolicy, referrerPolicy, noSniff,
    originAgentCluster, dnsPrefetchControl, ieNoOpen,
    frameguard, permittedCrossDomainPolicies, hidePoweredBy, hsts,
} from 'helmet';
import {
    ContentSecurityPolicyOptions, CORSOptions, DPCOptions,
    ExpectCtOptions, FrameguardOptions, PermittedPolicyOptions,
    PolicyOptions, RateLimitOptions, StrictTransportSecurityOptions,
} from './declarations';

export const enableCors = (router: Router, options?: CORSOptions): void => {
    if (options) router.use(cors(options));
    else router.use(cors());
    console.log('CORS enabled.');
};

export const localRateLimit = (
    options: RateLimitOptions, path: string, logger: Logger,
): RateLimitRequestHandler => {
    logger.info(`Custom rate limit enabled on path-'${path}', at ${options.max} hits per ${options.windowMs} milliseconds.`);
    const limiter = rateLimit(options);
    return limiter;
};

export const globalRateLimit = (options: RateLimitOptions): RateLimitRequestHandler => {
    const limiter = rateLimit(options);
    return limiter;
};

export const enableCSP = (router: Router, options?: ContentSecurityPolicyOptions): void => {
    if (options) router.use(contentSecurityPolicy(options));
    else router.use(contentSecurityPolicy());
    console.log('ContentSecurityPolicy enabled.');
};

export const enableCOEP = (router: Router): void => {
    router.use(crossOriginEmbedderPolicy());
    console.log('CrossOriginEmbedderPolicy enabled.');
};

export const enableNoSniff = (router: Router): void => {
    router.use(noSniff());
    console.log('NoSniff enabled.');
};

export const enableOAC = (router: Router): void => {
    router.use(originAgentCluster());
    console.log('OriginAgentCluster enabled.');
};

export const enableHSTS = (router: Router, options?: StrictTransportSecurityOptions): void => {
    if (options) router.use(hsts(options));
    else router.use(hsts());
    console.log('StrictTransportPolicy enabled.');
};

export const enableDPC = (router: Router, options?: DPCOptions): void => {
    if (options) router.use(dnsPrefetchControl(options));
    else router.use(dnsPrefetchControl());
    console.log('DNSPrefetchControl enabled.');
};

export const enableIeNoOpen = (router: Router): void => {
    router.use(ieNoOpen());
    console.log('IENoOpen enabled.');
};


export const enableHPB = (router: Router): void => {
    router.use(hidePoweredBy());
    console.log('HidePoweredBy enabled.');
};

export const enableXssFilter = (router: Router): void => {
    router.use(xssFilter());
    console.log('XssFilter enabled.');
};
