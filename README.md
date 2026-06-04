# Mechanic Shop Inventory Management

Full-stack MERN inventory application for a mechanic shop.

## Stack

- Frontend: React, Tailwind CSS, React Router, Recharts, jsPDF
- Backend: Node.js, Express.js, JWT auth
- Database: MongoDB, Mongoose

## Folder Structure

```text
/client
  /src
    /pages
    /components
    /context
    /utils
/server
  /models
  /routes
  /middleware
  /controllers
```

## Setup

Start MongoDB locally first.

```bash
cd server
npm install
npm run seed
npm run dev
```

Default owner account from `server/.env`:

```text
Email: owner@mechanicshop.com
Password: Owner@12345
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Backend values are in `server/.env`. Copy `server/.env.example` when deploying or creating another local environment.

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mechanic_inventory
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

