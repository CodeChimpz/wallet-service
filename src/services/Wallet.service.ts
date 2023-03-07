import {Repository} from "knex-db-connector";
import {IWallet, walletRepo} from "../schema/Wallet.schema.js";
import {query} from "express";

export class WalletService {
    repo: Repository<IWallet>

    constructor(repo: Repository<IWallet>) {
        this.repo = repo
    }

    async getByUser(user_id: number) {
        const result = await this.repo.find({
            where: (query) => query.where({
                user: user_id
            })
        })
        return result[0]
    }

    async check(_id: number) {
        //todo: API CALL to check
        return this.repo.find({
            where: (query) => query.where({
                _id: _id
            })
        })
    }

    async create(user_id: number, stripe_id: string) {
        //activation logic
        //part of transaction
        return this.repo.create({
            user: user_id,
            stripe_id: stripe_id,
            active: true,
        })
    }

}

export const wallets = new WalletService(walletRepo)