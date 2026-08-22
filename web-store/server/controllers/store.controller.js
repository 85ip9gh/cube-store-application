import stripe from 'stripe';
import path from 'path';
import Cube from '../Models/cube.model.js';

function publicImageUrl(req, imagePath) {
    if (!imagePath) {
        return undefined;
    }

    try {
        const filename = path.basename(new URL(imagePath).pathname);
        return `${req.protocol}://${req.get('host')}/static/${encodeURIComponent(filename)}`;
    } catch {
        return undefined;
    }
}

export async function checkout(req, res, next){
    if (process.env.CHECKOUT_ENABLED !== 'true' || !process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ error: 'Checkout is temporarily unavailable.' });
    }

    try {
        const requestedItems = Array.isArray(req.body?.items) ? req.body.items : [];
        if (requestedItems.length === 0 || requestedItems.length > 25) {
            return res.status(400).json({ error: 'Cart must contain between 1 and 25 items.' });
        }

        const quantities = new Map();
        for (const item of requestedItems) {
            const id = Number(item.id);
            const quantity = Number(item.quantity);
            if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
                return res.status(400).json({ error: 'Cart contains an invalid item.' });
            }
            quantities.set(id, (quantities.get(id) || 0) + quantity);
        }

        const cubes = await Cube.find({ id: { $in: [...quantities.keys()] } });
        if (cubes.length !== quantities.size) {
            return res.status(400).json({ error: 'Cart contains an unavailable item.' });
        }

        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

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
            line_items: cubes.map(cube => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: cube.title,
                        images: [publicImageUrl(req, cube.imagePath)].filter(Boolean)
                    },
                    unit_amount: Math.round(cube.price * 100)
                },
                quantity: quantities.get(cube.id)
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/#/home`,
            cancel_url: `${process.env.FRONTEND_URL}/#/home`
        });

        // Only what the browser needs to continue. The full session object
        // carries a good deal more than that and none of it belongs in a
        // response to an unauthenticated caller.
        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        next(error);
    }
};
