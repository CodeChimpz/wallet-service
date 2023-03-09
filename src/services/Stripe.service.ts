import * as Stripe from "stripe";
import {stripe} from "../init/stripe.js";

export class StripeService {
    stripe: Stripe.Stripe

    constructor(stripe: Stripe.Stripe) {
        this.stripe = stripe
    }

    async createCustomer(details: any) {
        const {address, email, name, phone, card} = details
        //register a stripe Card and get card token
        const token = await this.stripe.tokens.create({
            card: {
                number: card.number,
                exp_month: card.exp_month,
                exp_year: card.exp_year,
                cvc: card.cvc
            }
        })
        //create a stripe Customer
        const customer = await this.stripe.customers.create({
            // address: address,
            email: email,
            name: name,
            phone: phone,
            source: token.id
        })
        return customer
    }

    async charge(_id: string, money: number, currency: string, bet: string) {
        //pay for a bet
        return this.stripe.charges.create({
            customer: _id,
            amount: money,
            currency: currency,
            description: 'Payment for bet ' + bet
        })
    }

    async refund(stripe_charge: string) {
        return this.stripe.refunds.create({
            charge: stripe_charge
        })
    }

    //payout to user
    async payout(_id: string, amount: number) {
        if (amount === 0) {
            return
        }
        //todo: ACTUAL PAYOUTS with merchant accounts
        return {stripe_charge: 'dfsdfghhhhfds'}
    }
}

export const stripeService = new StripeService(stripe)