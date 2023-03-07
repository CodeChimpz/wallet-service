import {commiter} from "./init/sidecar.js";
import {Request, Response} from "express";
import {walletController} from "./controllers/Wallet.controller.js";
//leave bet
export const LeaveBetConsumer = commiter.commitConsumerFactory({
    prepare: walletController.startBet.bind(walletController),
    commit: walletController.initBet.bind(walletController),
    abort: walletController.revokeBet.bind(walletController),
})

