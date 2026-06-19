import stripe from 'stripe';

const stripeInstance = stripe('sk_test_REDACTED_ROTATED_2026_08_21');

export async function checkout(req, res, next){
    try {

        const session = await stripeInstance.checkout.sessions.create({
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'usd',
                        },
                        display_name: 'Free shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 5,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 7,
                            },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 1500,
                            currency: 'usd',
                        },
                        display_name: 'Next day air',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 1,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 1,
                            },
                        },
                    },
                },
            ],
            line_items: req.body.items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.product]
                    },
                    unit_amount: item.price * 100
                },
                quantity: item.quantity
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/#/home`,
            cancel_url: `${process.env.FRONTEND_URL}/#/home`
        });

        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
};