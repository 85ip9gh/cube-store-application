import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cubeDetails from './public/cube-details.json'; // Assuming this file exports the cube details
import dotenv from 'dotenv';
import stripe from 'stripe';

dotenv.config();

const app = express();
const stripeInstance = stripe('sk_test_51OTZqzA7JcW8dorug76raBGFUphZJhAncAifdvXzMXLZrp13kreGfvWnWOgB4xO0DvexcFBGHNn2uNUbMuyVbg0M00pRO5Cv6C');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

app.use('/static', express.static('cubes'));

app.get('/', (req, res) => {
    res.send('Hello from server');
});

app.get('/cubes(/category/:category)?', (req, res) => {
    const category = req.params.category;
    const size = req.query.size;
    const sort = req.query.sort;
    const limit = req.query.limit;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    let filteredByCubes = cubeDetails.items;

    if (category !== 'All') {
        filteredByCubes = cubeDetails.items.filter((cube) => !category || cube.category === category);
    }

    if (size !== 'All') {
        filteredByCubes = filteredByCubes.filter((cube) => !size || cube.size === size);
    }

    filteredByCubes = filteredByCubes.filter((cube) => cube.price >= minPrice && cube.price <= maxPrice);

    let sortedCubes = filteredByCubes.sort((a, b) => {
        if (sort === 'asc') {
            return a.title.localeCompare(b.title);
        } else {
            return b.title.localeCompare(a.title);
        }
    });

    if (limit === 'All') {
        return res.send(sortedCubes);
    }

    const limitCubes = sortedCubes.slice(0, parseInt(limit, 10));

    // have it commented out when the base64Image is already in the json file
    // encodeImagesAndWriteBack('./public/cube-details.json');
    res.send(limitCubes);
});

app.post('/checkout', async (req, res, next) => {
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
            success_url: 'http://localhost:4242/success.html',
            cancel_url: 'http://localhost:4242/cancel.html',
        });

        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
});

app.listen(4242, () => console.log('Server is running on port 4242'));
