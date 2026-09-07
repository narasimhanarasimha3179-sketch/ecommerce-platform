import express from "express";

const router = express.Router();

// GET all addresses
router.get("/", async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE address
router.post("/", async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;

    if (!name || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        message: "All address details are required",
      });
    }

    res.status(201).json({
      message: "Address received successfully",
      address: {
        name,
        phone,
        address,
        city,
        state,
        pincode,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE address
router.delete("/:id", async (req, res) => {
  try {
    res.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

export default router;