import pg from 'pg';

export type Options = pg.PoolConfig;

export type PoolClient = pg.PoolClient;

export type QueryResult = pg.QueryResult;

export type QueryResultRow = pg.QueryResultRow;

export type QueryArrayResult = pg.QueryArrayResult;

export type Parameters = (null | string | string[] | number | Date | JSON | Boolean)[];

export interface QueryFunction {
    (pgClient: pg.PoolClient, ...args: any[]): Promise<void>;
}
