const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
const path = require('path');

const sharp = require('sharp');
const fs = require('fs');

//for localhost
// var cubeDetails = require('./public/cube-details.json');

//for AWS vm
var cubeDetails = require('./public/cube-details-vm.json');

const stripe = require('stripe')('sk_test_51OTZqzA7JcW8dorug76raBGFUphZJhAncAifdvXzMXLZrp13kreGfvWnWOgB4xO0DvexcFBGHNn2uNUbMuyVbg0M00pRO5Cv6C');

app.use('/static', express.static('cubes'));

app.get('/', (req, res) => {
    res.send('Hello from server');
});

app.get('/cubes(/category/:category)?', (req, res) => {
    const category = req.params.category;
    const sort = req.query.sort;
    const limit = req.query.limit;
    let filteredByCubes = cubeDetails.items;

    if(category != 'All'){
        filteredByCubes = cubeDetails.items.filter((cube) => !category || cube.category === category);
    }

    let sortedCubes = filteredByCubes.sort((a, b) => {
        if (sort === 'asc') {
            return  a.title.localeCompare(b.title);
        } else {
            return  b.title.localeCompare(a.title);
        }
    });
 
    if(limit === 'All'){
        return res.send(sortedCubes);
    }

    limitCubes = sortedCubes.slice(0, parseInt(limit, 10));

    // have it commented out when the base64Image is already in the json file
    // encodeImagesAndWriteBack('./public/cube-details.json');
    res.send(limitCubes);

});

app.get('/cubes/generateBase64Images', async (req, res) => {
    encodeImagesAndWriteBack('./public/cube-details.json');
    res.send('Base64 encoding and update complete.');
});

app.get('/cubes/categories', (req, res) => {
    const uniqueCategories = cubeDetails.items.map(cube => cube.category)
        .reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], []);
    res.send(uniqueCategories);
});

async function encodeImageToBase64(imagePath) {
    try {
      const buffer = await sharp(imagePath).toFormat('png').toBuffer();
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error encoding image:', error);
      return null;
    }
  }
  
  async function encodeImagesAndWriteBack(jsonFilePath) {
    try {
      // Read the JSON file
      const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
      const jsonData = JSON.parse(jsonString);
  
      // Iterate through the items and encode images
      for (const item of jsonData.items) {
        const base64Image = await encodeImageToBase64(item.imagePath);
        if (base64Image) {
          item.base64Image = base64Image;
        }
      }
  
      // Update the JSON file with base64-encoded images
      const updatedJsonString = JSON.stringify(jsonData, null, 2);
      fs.writeFileSync(jsonFilePath, updatedJsonString);
  
      console.log('Base64 encoding and update complete.');
    } catch (error) {
      console.error('Error processing JSON:', error);
    }
  }

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


