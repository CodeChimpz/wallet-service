import {Repository, SchemaDataTypes} from "knex-db-connector";
import {dataSource} from "../init/db.js";

const betTransactionSchema = {
    user: {
        type: SchemaDataTypes.integer
    },
    bet:{
        type: SchemaDataTypes.integer
    },
    balance_Pre: {
        type: SchemaDataTypes.integer
    },
    balance_After: {
        type: SchemaDataTypes.integer
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

enum Resolves {
    win = 'win',
    loss = 'loss',
    pending = 'pending'
}

export interface ITransaction {
    user: number,
    balance_Pre: number,
    balance_After: number,
    amount: number,
    date: Date,
    status: 'finished' | 'open' | 'pending'
}

export interface IBetTransaction extends ITransaction {
    bet: number,
}

export interface IBetResolve extends ITransaction {
    bet: {
        type: SchemaDataTypes.integer
    },
    resolve: Resolves
}

export const betTransactionRepository: Repository<IBetTransaction> = await dataSource.createSchema('bet_transactions', betTransactionSchema, true)
