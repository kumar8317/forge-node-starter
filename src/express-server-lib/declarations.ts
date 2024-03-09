import { NextFunction, Request, Response } from 'express';
import { Options as RateLimit } from 'express-rate-limit';

export type CORSOptions = {
    origin?: boolean | string | RegExp | (boolean | string | RegExp)[];
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
};

export type RateLimitOptions = Partial<RateLimit>;

export type ContentSecurityPolicyOptions = {
    useDefaults?: boolean;
    directives?: { [key: string]: any };
    reportOnly?: boolean;
};

export type PolicyOptions = {
    policy?: string;
};

export type PermittedPolicyOptions = {
    permittedPolicies?: string
};

export type ExpectCtOptions = {
    maxAge?: number
    enforce?: boolean
    reportUri?: string
};

export type StrictTransportSecurityOptions = {
    maxAge?: number
    includeSubDomains?: boolean
    preload?: boolean
};

export type DPCOptions = {
    allow?: boolean;
};

export type FrameguardOptions = {
    action?: | 'DENY' | 'SAMEORIGIN' | (string & { _?: never });
};

type HealthCheckOptions = {
    /**
     * if true, it disables the health check route
     */
    disable?: boolean;
    /**
     * custom health check route (replaces default route /health)
     */
    routePath?: string;
}

export type Options = {
    enableGlobalRateLimiter: boolean;
    port?: number;
    serverName?: string;
    globalRateLimiterOptions?: RateLimitOptions;
    enableFileUpload?: boolean;
    cors?: {
        disable?: boolean;
        options?: CORSOptions;
    };
    securityHeaders?: {
        disableAll?: boolean;
        contentSecurityPolicy?: {
            disable?: boolean;
            options?: ContentSecurityPolicyOptions;
        };
        removeCrossOriginEmbedderPolicy?: boolean;
        crossOriginOpenerPolicy?: {
            disable?: boolean;
            options?: PolicyOptions;
        };
        crossOriginResourcePolicy?: {
            disable?: boolean;
            options?: PolicyOptions;
        };
        expectCt?: {
            disable?: boolean;
            options?: ExpectCtOptions;
        };
        referrerPolicy?: {
            disable?: boolean;
            options?: PolicyOptions;
        };
        strictTransportSecurity?: {
            disable?: boolean;
            options?: StrictTransportSecurityOptions;
        };
        removeNoSniff?: boolean;
        removeOriginAgentCluster?: boolean;
        dnsPrefetchControl?: {
            disable?: boolean;
            options?: DPCOptions;
        };
        removeIeNoOpen?: boolean;
        frameguard?: {
            disable?: boolean;
            options?: FrameguardOptions;
        };
        permittedCrossDomainPolicies?: {
            disable?: boolean;
            options?: PermittedPolicyOptions;
        };
        removeHidePoweredBy?: boolean;
        removeXSSFilter?: boolean;
    };
    healthCheck?: HealthCheckOptions;
};

/** Handler function for a route */
type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

type Method = 'get' | 'post' | 'put' | 'delete' | 'head' | 'connect' | 'options' | 'trace' | 'patch' | 'all';

export type SuccessCodes = 200 | 201 | 202 | 203 | 204 | 205 | 207 | 208 | 226;

/** Definition for a route */
export type Route = {
    isRoute: true;
    path: string;
    disableGlobalRateLimit?: boolean;
    rateLimit?: RateLimitOptions;
    method: Method;
    handlers: Handler[];
};

/** Definition for non route */
export type Routing = {
    isRoute: false;
    url: string;
    childRoutes: Array<Routing | Route>;
};
