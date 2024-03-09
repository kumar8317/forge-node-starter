import dotenv from "dotenv";
dotenv.config();
import { Options, ServerApp } from "../express-server-lib";
import config from "config";
import exampleRouting from "./apis/example";

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
// Initialize Server Object
const apiServer = new ServerApp(expressOptions);

apiServer.applyRoutes("", exampleRouting );

const initServer = async (): Promise<void> => {
  await apiServer.initalise();
};

const closeServer = async (): Promise<void> => {
  await apiServer.closeServer();
};

export { initServer, closeServer };