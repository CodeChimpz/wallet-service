import {Repository, SchemaDataTypes} from "knex-db-connector";
import {dataSource} from "../init/db.js";

const betTransactionSchema = {
    user: {
        type: SchemaDataTypes.integer
    },
    bet: {
        type: SchemaDataTypes.integer
    },
    stripe_charge: {
        type: SchemaDataTypes.string
    },
    amount: {
        type: SchemaDataTypes.integer
    },
    date: {
        type: SchemaDataTypes.datetime
    },
    status: {
        type: SchemaDataTypes.string
    }
}
const betResolveTransactionSchema = {
    ...betTransactionSchema,
    resolve: {
        type: SchemaDataTypes.string
    }
}
const betRefundSchema = {
    user: {
        type: SchemaDataTypes.integer
    },
    bet: {
        type: SchemaDataTypes.integer
    },
    stripe_charge: {
        type: SchemaDataTypes.string
    },
    date: {
        type: SchemaDataTypes.datetime
    },
}

enum Resolves {
    win = 'win',
    loss = 'loss',
    pending = 'pending'
}

export interface ITransaction {
    user: number,
    stripe_charge: string,
    amount: number,
    date: Date,
    status: 'finished' | 'open' | 'pending'
}

export interface IBetTransaction extends ITransaction {
    bet: number,
}

export interface IBetResolve extends ITransaction {
    bet: number,
    resolve: Resolves
}

export interface IBetRefund extends Exclude<ITransaction, 'amount' | 'status'> {
}

export const betTransactionRepository: Repository<IBetTransaction> = await dataSource.createSchema('bet_transactions', betTransactionSchema, true)
export const resolveTransactionRepository: Repository<IBetResolve> = await dataSource.createSchema('bet_resolves', betResolveTransactionSchema, true)
export const refundTransactionRepository: Repository<IBetRefund> = await dataSource.createSchema('bet_refund', betRefundSchema, true)