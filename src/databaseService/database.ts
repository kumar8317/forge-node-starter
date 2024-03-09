import pg from 'pg';
import { Options, Parameters, QueryFunction } from './declaration';
import * as Logger from '../utils/logger';
const logger = Logger.default("PG-DATABASE-SERVICE");
class PGDatabaseService {
    private pool?: pg.Pool;

    private readonly options: Options;

    constructor(options: Options) {
        this.options = options;
        logger.info('Database pool object initialized. Ready to be connected.');
    }

    /**
     * Connects to database pool.
     * @returns Pool object
     */
    async connect(): Promise<pg.Pool> {
        this.pool = new pg.Pool(this.options);
        const client = await this.pool.connect();
        logger.info('Connected to postgres database pool.');
        client.release();
        return this.pool;
    }

    /**
     * When you are finished with the pool if all the clients are idle the pool will close them
     * after config.idleTimeoutMillis and your app will shutdown gracefully.
     * If you don't want to wait for the timeout you can end the pool.
     */
    async shutdown(): Promise<void> {
        if (this.pool === undefined) logger.error('Cannot close as pool does not exist!');
        else {
            logger.info('Shuting down database pool...');
            await this.pool.end();
            logger.info('Database pool has been shut down.');
        }
    }

    /**
     * Allows execution of queries with internal managment of client connection.
     * @param queryString query formatted for placeholder based execution
     * @param parameters Array of parameters which shall be passed in placeholders
     * @returns Result of the query
     */
    async query(
        queryString: string,
        parameters: Parameters,
    ): Promise<pg.QueryResult<any>> {
        if (this.pool === undefined) throw new Error('Cannot run the query as pool connection is not initialized.');
        const client = await this.pool.connect();
        try {
            const queryResult = await client.query(queryString, parameters);
            return queryResult;
        } catch (error) {
            logger.error('Failed fetching query result:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * This function takes a pre-created client object to execute query,
     * but does not release query. Helpful for transaction based execution
     * where one client shall execute all queries.
     * @param client passing already created client object
     * @param queryString query formatted for placeholder based execution
     * @param parameters Array of parameters which shall be passed in placeholders
     * @returns Result of the query
     */
    // eslint-disable-next-line class-methods-use-this
    async queryByClient(
        client: pg.PoolClient,
        queryString: string,
        parameters: Parameters,
    ): Promise<pg.QueryResult<any>> {
        try {
            const queryResult = await client.query(queryString, parameters);
            return queryResult;
        } catch (error) {
            logger.error('Failed fetching query result:', error);
            throw error;
        }
    }

    /**
     * Allows database transaction commitment in a managed way
     * where the passed function can perform queries as needed.
     * @param queryFunction Function which makes use of connection client and resolves or
     * rejects promise to signal rollback and connection release.
     */
    async transaction(queryFunction: QueryFunction, ...args: any[]): Promise<void> {
        if (this.pool === undefined) throw new Error('Cannot run the transaction as pool connection is not initialized.');
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await queryFunction(client, ...args);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Transaction failed, rolling back.');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default PGDatabaseService;