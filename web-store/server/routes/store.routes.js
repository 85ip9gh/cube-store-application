import express from "express";

import{
    checkout,
} from "../controllers/store.controller.js";

const storeRouter = express.Router();

storeRouter.post('/checkout', checkout);

export default storeRouter;