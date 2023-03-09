import {registerEndpoint, registerMiddleware} from "mein-endpoint-registrator";
import {walletController} from "./controllers/Wallet.controller.js";
import e, {NextFunction, Request, Response} from "express";
import {logger} from "./init/logger.js";
import {LeaveBetConsumer, RefundBetConsumer, ResolveBetConsumer} from "./transactions.js";
import {sidecar} from "./init/sidecar.js";

export const router = e.Router()
const endpoints = {
    '/wallet/post': walletController.createCustomer,
    '/transactions/leave-bet': LeaveBetConsumer,
    '/transactions/leave-refund': RefundBetConsumer,
    '/transactions/resolve-bet': ResolveBetConsumer,
}
const mw = {
    '/transactions/leave-bet': [{mw: sidecar.registerEndpoint, ctx: sidecar as any}],
    '/transactions/leave-refund': [{mw: sidecar.registerEndpoint, ctx: sidecar as any}],
    '/transactions/resolve-bet': [{mw: sidecar.registerEndpoint, ctx: sidecar as any}],
}
registerMiddleware<(req: Request, res: Response, next: NextFunction) => Promise<void>>(router, mw)
registerEndpoint<(req: Request, res: Response) => Promise<void>>(router, endpoints, walletController, {
    cache: true,
    logger: logger
})