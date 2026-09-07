import User from "../models/User.js";

// Get Addresses
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json(user.addresses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Address
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses.push(req.body);

    await user.save();

    res.json(user.addresses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== req.params.id
    );

    await user.save();

    res.json(user.addresses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};