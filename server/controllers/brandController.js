import Brand from "../models/Brand.js";

// GET all brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });

    res.json(brands);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET single brand
export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.json(brand);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE brand
export const createBrand = async (req, res) => {
  try {
    const { name, logo, description } = req.body;

    const exists = await Brand.findOne({ name });

    if (exists) {
      return res.status(400).json({
        message: "Brand already exists",
      });
    }

    const brand = await Brand.create({
      name,
      logo,
      description,
    });

    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// UPDATE brand
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.json(brand);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// DELETE brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.json({
      message: "Brand deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};