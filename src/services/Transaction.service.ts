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

    //start initialization of a new bet
    async leaveBet(data: { user_id: number, date: Date, bet_id: number, from: number, to: number }) {
        const wallet_ = await this.wallet.getByUser(data.user_id)
        if (!wallet_) {
            return
        }
        //todo: proper BUSINESS logic , that's crap currently
        if (wallet_[0].balance !== data.to) {
            return
        }
        //set bet in pending state  to be confirmed or destoryed later
        return this.repo.create({
            user: data.user_id,
            amount: data.to - data.from,
            balance_Pre: data.from,
            balance_After: data.to,
            date: data.date,
            bet: data.bet_id,
            status: 'pending'
        })
    }

    //uninitialize a bet
    async revokeBet(bet_id: number) {
        return this.repo.delete((query) => query.where({bet: bet_id}))
    }

    //init a bet
    async initBet(bet_id: number) {
        return this.repo.edit({status: 'open'}, (query) => query.where({_id: bet_id}))
    }

    //resolve a bet
    async resolveBet(_id: number){

    }

}

export const transactions = new TransactionService(betTransactionRepository, wallets)