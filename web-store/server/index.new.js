import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cubeRouter from './routes/cube.routes.js';
import storeRouter from './routes/store.routes.js';


dotenv.config();

const app = express();

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
app.use("/", storeRouter);

app.listen(4242, () => console.log('Server is running on port 4242'));
