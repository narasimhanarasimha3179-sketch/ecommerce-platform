# ShopEase Ecommerce Platform

## Live Deployment Links

- **Frontend Storefront:** [https://ecommerce-frontend-b6is.onrender.com](https://ecommerce-frontend-b6is.onrender.com)
- **Backend API:** [https://ecommerce-backend-6qrt.onrender.com](https://ecommerce-backend-6qrt.onrender.com)

---
Full-stack MERN ecommerce application with:

- React + Vite frontend
- Express + MongoDB backend
- JWT authentication
- Product search, category and brand filters
- 100 seeded products across 20 categories
- Unique local product images
- Cart and wishlist
- Checkout and order tracking
- Cash on Delivery
- Razorpay Online Payment (UPI, cards, net banking and wallets)
- Payment signature verification
- Stock validation and reservation
- Admin product/order/user pages
- Cloudinary upload support

## Local setup

### 1. Backend

```powershell
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

Fill `server/.env` with your MongoDB and Razorpay credentials.

### 2. Frontend

```powershell
cd client
npm install
copy .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal.

## Root commands

From the project root:

```powershell
npm run seed
npm run server
npm run client
npm run build
npm start
```

## Production

### Vercel frontend + Render backend

- Deploy `client` as the Vercel project.
- Set `VITE_API_URL` to the deployed backend URL.
- Deploy `server` as a Render Node service.
- Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, Razorpay keys and Cloudinary keys in Render environment variables.
- Build command for the frontend: `npm run build`.
- Start command for the backend: `npm start`.

Never commit `.env` files or payment secrets.
