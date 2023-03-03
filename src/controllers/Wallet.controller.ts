import {LoggerService} from "mein-winston-logger";
import {Request, Response} from "express";
import {logger} from "../init/logger.js";
import {wallets, WalletService} from "../services/Wallet.service.js";
import {transactions, TransactionService} from "../services/Transaction.service.js";

class WalletController {
    logger: LoggerService
    wallets: WalletService
    transactions: TransactionService

    constructor(logger: LoggerService, wallets: WalletService, transactions: TransactionService) {
        this.wallets = wallets
        this.transactions = transactions
        this.logger = logger
    }

    async create(req: Request, res: Response) {
        try {
            //todo: validation
            const {user, balance} = req.body
            const result = await this.wallets.create(user, balance)
            if (!result) {
                res.status(400).json({message: 'something wrong '})
            }
            res.status(200).json({message: 'Successful registration'})
        } catch (e: any) {
            this.logger.app.error(e)
            res.status(500).json({message: 'Server error'})
            return
        }
    }

    async put(req: Request, res: Response) {
        try {
            const {id, amount} = req.body
            const result = await this.wallets.put(id, amount)
            if (!result) {
                res.status(400).json({message: 'something wrong'})
            }
            res.status(200).json({message: 'Successful transfer', data: result})
        } catch (e: any) {
            this.logger.app.error(e)
            res.status(500).json({message: 'Server error'})
            return
        }
    }

    //Transaction controllers
    async leaveBet(req: Request) {
        try {
            const {bet, money, user, date} = req.body.data
            const money_transfer = await this.wallets.withdraw(user, money)
            if (!money_transfer) {
                return {success: false, ctx: 'money_err'}
            }
            const transaction_write = await this.transactions.leaveBet({
                user_id: user,
                date: new Date(Date.parse(date)),
                bet_id: bet._id,
                from: money_transfer.balance_prev,
                to: money_transfer.balance_new,
            })
            if (!transaction_write) {
                //todo: HANDLE ERRORS while aborting
                return {success: false, ctx: 'tr_err'}
            }
            return {success: true}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, ctx: 'server_err'}
        }
    }

    async uninitBet(req: Request) {
        try {
            const {bet, money, user, date, ctx} = req.body.data
            //todo: CHECK balance state and revert if transaction passed on the account
            // await this.wallets.
            const revoked_ = await this.transactions.revokeBet(bet._id)
            return {success: !!revoked_}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, ctx: 'server_err'}
        }
    }

    async initBet(req: Request) {
        try {
            const {bet, money, user, date} = req.body.data
            const final_ = await this.transactions.initBet(bet._id)
            if (!final_) {
                return {success: false}
            }
            return {success: true}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, ctx: 'server_err'}
        }
    }

    // async withdraw(req: Request, res: Response) {
    //     try {
    //         const {id, amount} = req.body
    //         const result = await this.wallets.withdraw(id, amount)
    //         if (!result) {
    //             res.status(400).json({message: 'something wrong'})
    //         }
    //         res.status(200).json({message: 'Successful transfer', data: result})
    //     } catch (e: any) {
    //         this.logger.app.error(e)
    //         res.status(500).json({message: 'Server error'})
    //         return
    //     }
    // }
}

export const walletController = new WalletController(logger, wallets, transactions)