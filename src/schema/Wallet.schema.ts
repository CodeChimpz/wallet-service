import {dataSource} from "../init/db.js";
import {Repository, SchemaDataTypes} from "knex-db-connector";

const walletSchema = {
    user: {
        type: SchemaDataTypes.integer
    },
    stripe_id: {
        type: SchemaDataTypes.string
    },
    active: {
        type: SchemaDataTypes.boolean
    },
}

export interface IWallet {
    user: number
    //bank account details
    stripe_id: string
    //activation status
    active: boolean
}

export const walletRepo: Repository<IWallet> = await dataSource.createSchema<IWallet>('wallets', walletSchema, true)