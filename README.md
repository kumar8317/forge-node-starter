# Forge-Node-Starter
Starter Repo for node express server including database service layer on top of knex with postgres

The express-server-lib exposes below methods that can be used to spin up multiple servers

```
import { Options, ServerApp } from "../express-server-lib";

const serverName = "Server";

const serverPort: number = config.get(`${serverName}.port`);

const expressOptions: Options = {
  serverName,
  enableGlobalRateLimiter: config.get(`${serverName}.enableGlobalRateLimit`),
  port: serverPort,
  cors: { disable: true },
  securityHeaders: {
    disableAll: true,
  },
};
const apiServer = new ServerApp(expressOptions);

```
This will spin up server with default configuration of middlewares like cors and security headers