import express from "express";

import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

const router = express.Router();

// GET all brands
router.get("/", getBrands);

// GET single brand
router.get("/:id", getBrand);

// CREATE brand
router.post("/", createBrand);

// UPDATE brand
router.put("/:id", updateBrand);

// DELETE brand
router.delete("/:id", deleteBrand);

export default router;