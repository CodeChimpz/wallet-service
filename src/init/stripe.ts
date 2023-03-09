import {config} from "dotenv";
import * as Stripe from "stripe";

config()

export const stripe: Stripe.Stripe = process.env.ENVIRONMENT !== 'production' ? new Stripe.Stripe(String(process.env.SK_STRIPE_TEST), {
    apiVersion: '2022-11-15'
}) : new Stripe.Stripe(String(process.env.SK_STRIPE_PROD), {
    apiVersion: '2022-11-15'
})
