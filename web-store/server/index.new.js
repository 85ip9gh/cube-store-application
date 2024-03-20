import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import stripe from 'stripe';
import mongoose from 'mongoose';
import cubeRouter from './routes/cube.routes.js';


dotenv.config();

const app = express();
const stripeInstance = stripe('sk_test_51OTZqzA7JcW8dorug76raBGFUphZJhAncAifdvXzMXLZrp13kreGfvWnWOgB4xO0DvexcFBGHNn2uNUbMuyVbg0M00pRO5Cv6C');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.use('/static', express.static('cubes'));

app.get('/', (req, res) => {
    res.send('Hello the World!');
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

app.use("/api", cubeRouter);

app.listen(4242, () => console.log('Server is running on port 4242'));
