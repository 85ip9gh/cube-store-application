const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

const sharp = require('sharp');
const fs = require('fs');

var cubeDetails = require('./public/cube-details.json');

const stripe = require('stripe')('sk_test_51OTZqzA7JcW8dorug76raBGFUphZJhAncAifdvXzMXLZrp13kreGfvWnWOgB4xO0DvexcFBGHNn2uNUbMuyVbg0M00pRO5Cv6C');

app.get('/', (req, res) => {
    res.send('Hello from server');
});

app.get('/cubes', (req, res) => {
    cubeDetails.cubes.forEach( cube => {
         convertToBase64("{cube.image}", async function(base64Img){
            cube.product = await base64Img;
        });
    });

    res.send(cubeDetails.cubes);
});

app.post('/checkout', async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.create({
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

function convertToBase64(inputPath, callback, outputFormat = 'png') {
    sharp(inputPath)
        .toFormat(outputFormat.toLowerCase()) // Ensure outputFormat is not undefined
        .toBuffer((err, data, info) => {
            if (err) {
                console.error('Error processing image:', err);
                callback(null);
            } else {
                const dataURL = `data:image/${outputFormat.toLowerCase()};base64,${data.toString('base64')}`;
                callback(dataURL);
            }
        });
}
