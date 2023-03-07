import {Repository} from "knex-db-connector";
import {IBetTransaction, ITransaction, betTransactionRepository} from "../schema/Transaction.schema.js";
import {wallets, WalletService} from "./Wallet.service.js";
import {query} from "express";

export class TransactionService {
    repo: Repository<IBetTransaction>
    wallet: WalletService

    constructor(repo: Repository<IBetTransaction>, wallet: WalletService) {
        this.repo = repo
        this.wallet = wallet
    }

    //get by id
    async get(bet_id: number) {
        const result = await this.repo.find({where: (query) => query.where({bet: bet_id})})
        return result[0]
    }

    //start initialization of a new bet
    async leaveBet(data: { user_id: number, date: Date, bet_id: number, money: number, currency: string, charge: string }) {
        //set bet in pending state  to be confirmed or destoryed later
        return this.repo.create({
            user: data.user_id,
            amount: data.money,
            date: data.date,
            bet: data.bet_id,
            status: 'pending',
            stripe_charge: data.charge
        })
    }

    //uninitialize a bet
    async revokeBet(bet_id: number) {
        return this.repo.delete((query) => query.where({bet: bet_id}))
    }

    //init a bet
    async initBet(bet_id: number) {
        return this.repo.edit({status: 'open'}, (query) => query.where({bet: bet_id}))
    }

    //resolve a bet
    async resolveBet(_id: number) {

    }

}

export const transactions = new TransactionService(betTransactionRepository, wallets)