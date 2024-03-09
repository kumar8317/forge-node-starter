/* eslint-disable import/first */
const dotenv = require('dotenv');

dotenv.config();

const config = require('config');

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: config.get('Database.host'),
      port: config.get('Database.port'),
      user: config.get('Database.user'),
      password: config.get('Database.password'),
      database: config.get('Database.database'),
    },
    pool: {
      min: 2,
      max: 100,
      "propagateCreateError": false
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
  production: {
    client: "pg",
    connection: {
      host: config.get('Database.host'),
      port: config.get('Database.port'),
      user: config.get('Database.user'),
      password: config.get('Database.password'),
      database: config.get('Database.database'),
    },
    pool: {
      min: 2,
      max: 100,
      "propagateCreateError": false
    },
    migrations: {
      tableName: "knex_migrations",
    },
  }
};
