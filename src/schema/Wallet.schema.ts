import {dataSource} from "../init/db.js";
import {Repository, SchemaDataTypes} from "knex-db-connector";

const walletSchema = {
    user: {
        type: SchemaDataTypes.integer
    },
    balance: {
        type: SchemaDataTypes.integer
    },
    active: {
        type: SchemaDataTypes.boolean
    },
    status: {
        type: SchemaDataTypes.string
    }
}

export interface IWallet {
    user: number
    balance: number
    active: boolean
    status: 'pending' | 'accessible'
}

export const walletRepo: Repository<IWallet> = await dataSource.createSchema('wallets', walletSchema, true)