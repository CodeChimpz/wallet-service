import {Repository} from "knex-db-connector";
import {
    IBetTransaction,
    ITransaction,
    betTransactionRepository,
    resolveTransactionRepository, IBetResolve, Resolves
} from "../schema/Transaction.schema.js";
import {wallets, WalletService} from "./Wallet.service.js";
import {query} from "express";

export class TransactionService {
    repo: Repository<IBetTransaction>

    constructor(repo: Repository<IBetTransaction>) {
        this.repo = repo
    }

    //get by id
    async get(bet_id: number) {
        const result = await this.repo.find({where: (query) => query.where({bet: bet_id})})
        return result[0]
    }

    //start initialization of a new bet or refund
    async create(data: { user: number, bet: number, stripe_charge: string, type: string }) {
        //set bet in pending state  to be confirmed or destoryed later
        return this.repo.create({
                ...data,
                status: 'pending'
            }
        )
    }

    //uninitialize a bet
    async revoke(bet_id: number) {
        return this.repo.delete((query) => query.where({bet: bet_id}))
    }

    //init a bet
    async confirm(_id: number) {
        return this.repo.edit({status: 'finished'}, (query) => query.where({_id: _id}))
    }
}

export class TransactionResolverService {
    repo: Repository<IBetResolve>

    constructor(repo: Repository<IBetResolve>) {
        this.repo = repo
    }

    //check if the payment is due still
    async check(bet_id: number) {
        const res = await this.repo.find({
            select: 'status',
            where: (query) => query.where({bet: bet_id})
        })
        return res[0].status
    }

    //resolve transaction
    async settle(bet_id: number, user: number, result: Resolves, stripe_charge?: string | undefined) {
        return this.repo.create({
            resolve: result,
            bet: bet_id,
            stripe_charge,
            status: 'confirmed'
        })
    }

}

export const betTransactions = new TransactionService(betTransactionRepository)
export const betResolves = new TransactionResolverService(resolveTransactionRepository)