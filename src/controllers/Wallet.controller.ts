import {LoggerService} from "mein-winston-logger";
import {Request, Response} from "express";
import {logger} from "../init/logger.js";
import {wallets, WalletService} from "../services/Wallet.service.js";
import {
    betResolves,
    betTransactions,
    TransactionResolverService,
    TransactionService
} from "../services/Transaction.service.js";
import * as Stripe from "stripe";
import {config} from "dotenv";
import {stripe} from "../init/stripe.js";
import {StripeService, stripeService} from "../services/Stripe.service.js";

config()

class WalletController {
    logger: LoggerService
    wallets: WalletService
    transactions: TransactionService
    stripe: StripeService
    resolve: TransactionResolverService

    constructor(logger: LoggerService, stripe: StripeService, wallets: WalletService, transactions: TransactionService, resolve: TransactionResolverService) {
        this.logger = logger
        this.stripe = stripe
        this.transactions = transactions
        this.resolve = resolve
        this.wallets = wallets
    }

    //create a stripe customer and save it the customer data for the user
    async createCustomer(req: Request, res: Response) {
        try {
            const {user, details} = req.body
            const customer = await this.stripe.createCustomer(details)
            //save stripe customer to db
            const result = await this.wallets.create(user, customer.id)
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

    //initiate stripe payment intent for client stripe payment with checkout
    async initiateBet(req: Request, res: Response) {
        try {
            const {user, details} = req.body
            res.status(200).json({message: 'Successful registration'})
        } catch (e: any) {
            this.logger.app.error(e)
            res.status(500).json({message: 'Server error'})
            return
        }
    }

    //Transaction controllers
    //CREATE BET
    //create an uninitialised bet
    //todo: vig
    async startBet(req: Request) {
        try {
            const {bet, money, currency, user} = req.body.data
            //get stripe customer
            const {stripe_id} = await this.wallets.getByUser(user)
            if (!stripe_id) {
                return {success: false, error: 'user_not_found'}
            }
            const payment_ = await this.stripe.charge(stripe_id, money, currency, bet._id)
            //leave transaction
            const transaction_write = await this.transactions.create({
                user: user,
                bet: bet._id,
                stripe_charge: payment_.id,
                type: 'bet'
            })
            if (!transaction_write) {
                return {success: false, error: 'transaction_error'}
            }
            return {success: true, data: {_id: transaction_write._id}}
        } catch (e: any) {
            //todo: ERROR HANDLING
            this.logger.app.error(e)
            return {success: false, error: e.type || 'server_err'}
        }
    }

    //remove on failed commit
    async abortBet(req: Request) {
        //todo: ERROR HANDLING
        try {
            const {bet, user} = req.body.data
            //refund if error was not on stripe and payment was successful
            await handleStripeErrors(req.body.ctx.error, async () => {
                //get stripe charge
                const {stripe_charge} = await this.transactions.get(bet._id)
                if (!stripe_charge) {
                    return {success: false, error: 'charge_not_found'}
                }
                //refund
                await this.stripe.refund(stripe_charge)
            })
            //delete transaction data
            const revoked_ = await this.transactions.revoke(bet._id)
            // const revoked_ = true
            return {success: !!revoked_}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, error: e.type || 'server_err'}
        }
    }

    //approve bet
    async commitBet(req: Request) {
        try {
            console.log(req.body.ctx)
            const final_ = await this.transactions.confirm(req.body.ctx.data._id)
            return {success: true}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, error: 'server_err'}
        }
    }

    //REFUND BET
    async startRefund(req: Request) {
        try {
            const {bet, user} = req.body.data
            //get charge id
            const charge_ = await this.transactions.get(bet)
            if (!charge_) {
                return {success: false, error: 'bet_not_found'}
            }
            //refund
            const refund_ = await this.stripe.refund(charge_.stripe_charge)
            const transaction_write = await this.transactions.create({
                user: user,
                bet: bet._id,
                stripe_charge: charge_.stripe_charge,
                type: 'refund'
            })
            return {success: true, data: {_id: transaction_write._id}}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, error: e.type || 'server_err'}
        }
    }

    async abortRefund(req: Request) {
        //todo: ABORT
        return {success: false, error: req.body.ctx.error}
    }

    async commitRefund(req: Request) {
        try {
            const {bet, user} = req.body.data
            //create tran saction in db
            await this.transactions.confirm(req.body.ctx.data._id)
            return {success: true}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, error: e.type || 'server_err'}
        }

    }

    //SETTLE BET
    //do finance stuff
    async startSettle(req: Request) {
        try {
            const {user, payout, resolve, vig} = req.body.data
            //get stripe customer
            const {stripe_id} = await this.wallets.getByUser(user)
            if (!stripe_id) {
                return {success: false, error: 'user_not_found'}
            }
            //payout user win
            const payout_ = await this.stripe.payout(stripe_id, payout)
            return {success: true, data: {stripe_charge: payout_?.stripe_charge}}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, error: e.type || 'server_err'}
        }
    }

    async abortSettle(req: Request) {
        try {
            //todo: ABORT
            return {success: false, error: req.body.ctx.error}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, error: e.type || 'server_err'}
        }
    }

    //write down transaction
    async commitSettle(req: Request) {
        try {
            const {bet, user, resolve} = req.body
            const settled_ = await this.resolve.settle(bet, user, resolve, req.body.ctx.data?.stripe_charge)
            return {success: true}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, error: 'server_err'}
        }
    }

}

export const walletController = new WalletController(logger, stripeService, wallets, betTransactions, betResolves)


//UTIL
const StripeErrors = ['api_error',
    'card_error', 'idempotency_error', 'invalid_request_error']
//pass functions that will execute on stripe errors
//todo: differentiate between stripe errors mb if needed
export async function handleStripeErrors(e: any, isErr: (...args: any[]) => Promise<any>): Promise<void> {
    if (!StripeErrors.includes(e?.type)) {
        await isErr()
    }
}