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
    status: {
        type: SchemaDataTypes.string
    },
    type: {
        type: SchemaDataTypes.string
    }
}
const betResolveTransactionSchema = {
    ...betTransactionSchema,
    resolve: {
        type: SchemaDataTypes.string
    }
}


//base transaction
export interface ITransaction {
    user: number,
    stripe_charge: string,
    status: Confirmed
}

//leave bet or refund bet transaction
export interface IBetTransaction extends ITransaction {
    bet: number,
    type: TransTypes
}

//resolve bet transactions
export interface IBetResolve extends ITransaction {
    bet: number,
    resolve: Resolves
}

export enum Resolves {
    win = 'win',
    loss = 'loss',
    draw = 'draw',
    pending = 'pending'
}

export enum TransTypes {
    refund = 'refund',
    bet = 'bet'
}

export enum Confirmed {
    true = 'confirmed',
    false = 'pending'
}


export const betTransactionRepository: Repository<IBetTransaction> = await dataSource.createSchema('bet_transactions', betTransactionSchema, true)
export const resolveTransactionRepository: Repository<IBetResolve> = await dataSource.createSchema('bet_resolves', betResolveTransactionSchema, true)