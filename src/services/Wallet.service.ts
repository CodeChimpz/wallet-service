import {Repository} from "knex-db-connector";
import {IWallet, walletRepo} from "../schema/Wallet.schema.js";
import {query} from "express";

export class WalletService {
    repo: Repository<IWallet>

    constructor(repo: Repository<IWallet>) {
        this.repo = repo
    }

    async getByUser(user_id: number) {
        return this.repo.find({
            where: (query) => query.where({
                user: user_id
            })
        })
    }

    async check(_id: number) {
        //todo: API CALL to check
        return this.repo.find({
            where: (query) => query.where({
                _id: _id
            })
        })
    }

    async create(user_id: number, balance: string) {
        //activation logic
        //part of transaction
        return this.repo.create({
            user: user_id,
            balance: balance,
            active: true,
            status:'accessible'
        })
    }

    async put(user_id: number, amount: number, from?: any) {
        //todo: BUSINESS LOGIC & API
        const balance_prev = await this.repo.find({
            select: ['balance'],
            where: (query: any) => query.where({_id: user_id})
        })
        const balance_new = Number(balance_prev) + amount
        const res = await this.repo.edit({
            balance: balance_new + amount
        }, (query: any) => query.where({_id: user_id}))
        if (!res) {
            return
        }
        return {balance_prev: balance_prev[0].balance, balance_new}
    }

    async withdraw(user_id: number, amount: number, to?: any) {
        //todo: BUSINESS LOGIC & APIs
        //todo: Handle currency errors differently than app errors
        const balance_prev = await this.repo.find({
            select: ['balance'],
            where: (query: any) => query.where({user: user_id})
        })
        const balance_new = Number(balance_prev[0].balance) - amount

        const res = await this.repo.edit({
            balance: balance_new
        }, (query: any) => query.where({user: user_id}))
        if (!res) {
            return
        }
        return {balance_prev: balance_prev[0].balance, balance_new}
    }
}

export const wallets = new WalletService(walletRepo)