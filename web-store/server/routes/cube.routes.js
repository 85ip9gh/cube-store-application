import express from "express";
import {
  getAllCubes,
  getSortedCubes,
  getCubeCategories,
  getCubeSizes,
  updateCube,
  deleteAllCubes,  
} from "../controllers/cube.controller.js";

const cubeRouter = express.Router();

cubeRouter.get("/cubes", getAllCubes);
cubeRouter.get('/cubes(/category/:category)?', getSortedCubes);
cubeRouter.get('/cubes/categories', getCubeCategories);
cubeRouter.get('/cubes/sizes', getCubeSizes);
cubeRouter.put('/cubes/update', updateCube);
cubeRouter.delete('/cubes', deleteAllCubes);

export default cubeRouter;