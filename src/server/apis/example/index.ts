import { Request, Response } from "express";
import { Route, Routing, handleErrorResponse, sendDataResponse } from '../../../express-server-lib';
import * as Logger from '../../../utils/logger';
const logger = Logger.default("Example-API");

export const createExample:Route = {
    isRoute: true,
    path: "/",
    method: "get",
    handlers: [
        async(req:Request,res: Response):Promise<void> => {
            try {
                const response = {
                    message:'Powered By Forge Cli tool'
                }
                return sendDataResponse(response,res)
            } catch (error) {
                logger.fatal("error,", error);
                return handleErrorResponse(<Error> error,res);
            }
        }
    ]
}

const exampleRouting: Routing = {
  isRoute: false,
  url: '',
  childRoutes: [
   createExample
  ],
};

export default exampleRouting;