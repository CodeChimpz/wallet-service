import {commiter} from "./init/sidecar.js";
import {Request, Response} from "express";
import {walletController} from "./controllers/Wallet.controller.js";

//leave bet
export const LeaveBetConsumer = commiter.commitConsumerFactory({
    prepare: walletController.startBet.bind(walletController),
    commit: walletController.commitBet.bind(walletController),
    abort: walletController.abortBet.bind(walletController),
}, 'bet')

//remove bet
export const RefundBetConsumer = commiter.commitConsumerFactory({
    prepare: walletController.startRefund.bind(walletController),
    commit: walletController.commitRefund.bind(walletController),
    abort: walletController.abortRefund.bind(walletController)
}, 'refund')

//resolve bet
export const ResolveBetConsumer = commiter.commitConsumerFactory({
    prepare: walletController.startSettle.bind(walletController),
    abort: walletController.abortSettle.bind(walletController),
    commit: walletController.commitSettle.bind(walletController)
}, 'resolve')

