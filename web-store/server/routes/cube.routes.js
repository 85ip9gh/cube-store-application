import express from "express";
import {
  getSortedCubes,
  getCubeCategories,
  getCubeSizes,
  createCube,
  updateCube,
  deleteCube,
  deleteAllCubes,
} from "../controllers/cube.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const cubeRouter = express.Router();

cubeRouter.get('/cubes(/category/:category)?', getSortedCubes);
cubeRouter.get('/cubes/categories', getCubeCategories);
cubeRouter.get('/cubes/sizes', getCubeSizes);
cubeRouter.post('/cubes', authenticateAdmin, upload.single('image'), createCube);
cubeRouter.put('/cubes/update/:id', authenticateAdmin, upload.single('image'), updateCube);
cubeRouter.delete('/cubes/:id', authenticateAdmin, deleteCube);
cubeRouter.delete('/cubes', authenticateAdmin, deleteAllCubes);

export default cubeRouter;