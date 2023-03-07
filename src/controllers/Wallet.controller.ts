import {LoggerService} from "mein-winston-logger";
import {Request, Response} from "express";
import {logger} from "../init/logger.js";
import {wallets, WalletService} from "../services/Wallet.service.js";
import {transactions, TransactionService} from "../services/Transaction.service.js";
import * as Stripe from "stripe";
import {config} from "dotenv";
import {stripe} from "../init/stripe.js";

config()

class WalletController {
    logger: LoggerService
    wallets: WalletService
    transactions: TransactionService
    //
    stripe: Stripe.Stripe

    constructor(logger: LoggerService, stripe: Stripe.Stripe, wallets: WalletService, transactions: TransactionService) {
        this.logger = logger
        this.stripe = stripe
        this.transactions = transactions
        this.wallets = wallets
    }

    async create(req: Request, res: Response) {
        try {
            const {user, details} = req.body
            const {address, email, name, phone, card} = details
            //register a stripe Card and get card token
            const token = await this.stripe.tokens.create({
                card: {
                    number: card.number,
                    exp_month: card.exp_month,
                    exp_year: card.exp_year,
                    cvc: card.cvc
                }
            })
            //create a stripe Customer
            const customer = await this.stripe.customers.create({
                // address: address,
                email: email,
                name: name,
                phone: phone,
                source: token.id
            })
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

    //initiate stripe payment intent for client stripe payment
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
    //create an uninitialised ber
    async startBet(req: Request) {
        try {
            const {bet, money, currency, user, date} = req.body.data
            //get stripe customer
            const {stripe_id} = await this.wallets.getByUser(user)
            if (!stripe_id) {
                return {success: false, ctx: 'user_not_found'}
            }
            //pay for a bet
            const payment_ = await this.stripe.charges.create({
                customer: stripe_id,
                amount: money,
                currency: currency,
                description: 'Payment for bet ' + bet._id
            })
            //leave transaction
            const transaction_write = await this.transactions.leaveBet({
                user_id: user,
                date: new Date(Date.parse(date)),
                bet_id: bet._id,
                money: money,
                currency: currency,
                charge: payment_.id
            })
            if (!transaction_write) {
                return {success: false, ctx: 'transaction_error'}
            }
            return {success: true}
        } catch (e: any) {
            //todo: ERROR HANDLING
            this.logger.app.error(e)
            return {success: false, ctx: e.type || 'server_err'}
        }
    }

    //remove bet
    async revokeBet(req: Request) {
        //todo: ERROR HANDLING
        try {
            const {bet, user, ctx} = req.body.data
            //refund if error was not on stripe and payment was successful
            if (!['api_error', 'card_error', 'idempotency_error', 'invalid_request_error'].includes(ctx)) {
                //get stripe charge
                const {stripe_charge} = await this.transactions.get(bet._id)
                if (!stripe_charge) {
                    return {success: false, ctx: 'charge_not_found'}
                }
                //refund
                const refund = await this.stripe.refunds.create({
                    charge: stripe_charge
                })
            }
            //delete transaction data
            const revoked_ = await this.transactions.revokeBet(bet._id)
            // const revoked_ = true
            return {success: !!revoked_}
        } catch (e: any) {
            this.logger.app.error(e)
            return {success: false, ctx: e.type || 'server_err'}
        }
    }

    //approve bet
    async initBet(req: Request) {
        try {
            const {bet} = req.body.data
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

}

export const walletController = new WalletController(logger, stripe, wallets, transactions)