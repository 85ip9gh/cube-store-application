import express from "express";
import {
  getSortedCubes,
  getCubeCategories,
  getCubeSizes,
  updateCube,
  deleteAllCubes,
} from "../controllers/cube.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const cubeRouter = express.Router();

cubeRouter.get('/cubes(/category/:category)?', getSortedCubes);
cubeRouter.get('/cubes/categories', getCubeCategories);
cubeRouter.get('/cubes/sizes', getCubeSizes);
cubeRouter.put('/cubes/update/:id', authenticateAdmin, updateCube);
cubeRouter.delete('/cubes', authenticateAdmin, deleteAllCubes);

export default cubeRouter;