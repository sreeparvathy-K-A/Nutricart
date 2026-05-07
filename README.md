# Nutricart

Nutricart is a full-stack food ordering and management application built with React, Node.js, Express, and MongoDB. It supports separate workflows for clients, food business owners, delivery partners, and admins.

## Features

- Client registration, login, menu browsing, cart, checkout, and order tracking
- Owner registration with document/image uploads and admin approval
- Owner dashboard for adding and managing food items
- Delivery registration, approval, delivery dashboard, and order status updates
- Admin dashboard for managing clients, owners, delivery partners, and delivery assignment
- Role-based navigation and protected dashboard routes
- Responsive page layouts for desktop and mobile

## Tech Stack

- Frontend: React, React Router, Axios, CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: JWT-based backend auth flow
- Uploads: Multer file uploads
- Payments: Cash on Delivery and Razorpay checkout for UPI/Card

## Project Structure

```text
Nutricart/
  client/
    public/
    src/
      assets/
      components/
      CSS-pages/
      pages/
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    uploads/
```

## Getting Started

### 1. Clone The Repository

```bash
git clone <your-repository-url>
cd Nutricart
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/` using `server/.env.example` as a guide:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend:

```bash
npm start
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Main Routes

- `/` - Home page
- `/menu` - Food menu
- `/cart` - Client cart
- `/checkout` - Checkout
- `/orders` - Client orders
- `/login` - Login
- `/register-client` - Client registration
- `/register-owner` - Owner registration
- `/register-delivery` - Delivery registration
- `/client-dashboard` - Client dashboard
- `/owner` - Owner dashboard
- `/delivery-dashboard` - Delivery dashboard
- `/admin-dashboard` - Admin dashboard

## User Roles

- `client` - Browses food, manages cart, places orders, views orders
- `owner` - Registers business, waits for approval, manages food items
- `delivery` - Receives assigned orders and updates delivery status
- `admin` - Reviews users, approves/rejects registrations, assigns delivery partners

## Environment Variables

The backend expects these variables in `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Do not commit real `.env` files to GitHub.

## Payments

- Cash on Delivery orders are saved with payment status `Pending`.
- UPI and Card payments use Razorpay Checkout.
- For Razorpay test payments, add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `server/.env`.
- The backend verifies the Razorpay payment signature before saving the payment as `Paid`.

## Build

To build the React app:

```bash
cd client
npm run build
```

## GitHub Notes

Before pushing, make sure these are ignored:

- `node_modules/`
- `client/build/`
- `server/.env`
- upload/runtime files you do not want in the repository

## Author

Sreeparvathy K A
