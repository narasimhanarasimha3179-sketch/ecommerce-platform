import { createSlice } from "@reduxjs/toolkit";

const loadWishlist = () => {
  const wishlist = localStorage.getItem("wishlist");
  return wishlist ? JSON.parse(wishlist) : [];
};

const saveWishlist = (wishlistItems) => {
  localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
};

const initialState = {
  wishlistItems: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.wishlistItems.find(
        (item) => item._id === action.payload._id
      );

      if (!exists) {
        state.wishlistItems.push(action.payload);
      }

      saveWishlist(state.wishlistItems);
    },

    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter(
        (item) => item._id !== action.payload
      );

      saveWishlist(state.wishlistItems);
    },

    clearWishlist: (state) => {
      state.wishlistItems = [];
      saveWishlist(state.wishlistItems);
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;