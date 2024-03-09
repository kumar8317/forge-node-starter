import config from 'config';
import PGDatabaseService from '../databaseService';

const databaseService = new PGDatabaseService(config.get('Database'));

const closeDbConnectionPool = async (): Promise<void> => {
    await databaseService.shutdown();
};

const initDbConnectionPool = async (): Promise<void> => {
    await databaseService.connect();
};

export default databaseService;
export { closeDbConnectionPool, initDbConnectionPool };