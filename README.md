# 🚀 Next-Gen_CRM_System

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)

A full-stack, production-ready **Customer Relationship Management (CRM)** platform built with the **PERN stack** — PostgreSQL, Express.js, React, and Node.js — enhanced by **Prisma ORM**, **Redux Toolkit**, and **TypeScript**.

Next-Gen CRM helps teams efficiently manage leads, contacts, activities, deals, and notifications — all in one place — with role-based access and modern analytics.

> "Next-Gen CRM is designed for performance, scalability, and clarity — built to empower teams managing modern customer relationships.”

---

## 🧭 Table of Contents

- [🧩 Core Features](#-core-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚙️ Getting Started](#️-getting-started)
  - [Prerequisites](#1-prerequisites)
  - [Installation](#2-installation)
  - [Environment Variables](#3-environment-variables)
  - [Running the Application](#4-running-the-application)
- [🚀 Build & Deployment](#-build--deployment)
- [🧠 API Overview](#-api-overview)
- [🗄️ Common Prisma Commands](#️-common-prisma-commands)
- [🧑‍💻 Contributing](#-contributing)
- [🪪 License](#-license)
- [📧 Contact](#-contact)

---

## 🧩 Core Features

## 🖥️ Live Demo

🔗 [Frontend (Vercel)](https://next-gen-crm-system.vercel.app)  
🔗 [Backend API (Render)](https://next-gen-crm-backend.onrender.com/api/v1)

### 🔐 Authentication & Authorization

- JWT-based secure login/signup with bcrypt password hashing.
- Role-based access control (`ADMIN`, `SALES`, `MANAGER`).
- Protected routes (both frontend and backend).

### 👥 Contact & Lead Management

- CRUD for contacts, leads, and customer data.
- Track status, communication logs, and notes.
- Quick filters for “Hot”, “Warm”, and “Cold” leads.

### 🧾 Activities & History Tracking

- Log meetings, calls, and follow-ups per user or contact.
- System history stored with timestamps and pagination.

### 🔔 Notification System

- Real-time notifications for user actions and updates.
- Mark as read / mark all read / delete notification APIs.

### 📊 Dashboard & Analytics

- Overview of leads, conversions, active users, and history trends.
- Role-based dashboard layout and analytics charts.

### ⚙️ Admin Panel

- Manage users, roles, and permissions.
- Monitor overall activity logs and system usage.

---

````markdown

## 🏗️ Tech Stack

| Layer          | Technology                                                  |
| :------------- | :---------------------------------------------------------- |
| **Frontend**   | React (Vite), Redux Toolkit, React Query, TypeScript, Axios |
| **Backend**    | Node.js, Express.js, Prisma ORM                             |
| **Database**   | PostgreSQL                                                  |
| **Auth**       | JWT + bcrypt                                                |
| **UI Library** | Chakra UI + Shadcn/UI                                       |
| **Deployment** | Render (Backend + DB) / Vercel (Frontend)                   |

---

## 📂 Project Structure

```bash
next-gen-crm/
│
├── backend/
│   ├── src/
│   │   ├── prisma/           # Prisma schema + migrations
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # Express routes
│   │   ├── middlewares/      # Auth & error handling
│   │   ├── models/           # (Optional) model helpers
│   │   ├── utils/            # JWT, logger, etc.
│   │   ├── server.js         # Express entry
│   │   └── app.js            # Express app setup
│   ├── package.json
│   └── prisma/schema.prisma
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Redux store setup
│   │   ├── components/       # Shared UI components
│   │   ├── features/         # Redux slices (auth, contacts, etc.)
│   │   ├── pages/            # Routes (Dashboard, Login, Contacts)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Helper functions
│   │   └── main.tsx          # App entry
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example
├── README.md
└── package.json
```
````

---

## ⚙️ Getting Started

### 1\. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- A running PostgreSQL database instance

### 2\. Installation

1.  **Clone the Repository**

    ```sh
    git clone [https://github.com/mahi-in9/Next-Gen_CRM_System.git](https://github.com/mahi-in9/Next-Gen_CRM_System.git)
    cd next-gen-crm
    ```

2.  **Backend Setup**

    ```sh
    cd backend
    npm install
    ```

3.  **Frontend Setup**

    ```sh
    cd ../frontend
    npm install
    ```

### 3\. Environment Variables

Create a `.env` file in the `backend/` folder and add the following:

```env
# /backend/.env

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your-super-secret-key-that-is-at-least-32-chars"
PORT=4000
NODE_ENV=development
```

Create a `.env` file in the `frontend/` folder and add the following:

```env
# /frontend/.env

VITE_API_URL="http://localhost:4000/api/v1"
```

### 4\. Running the Application

1.  **Run the Backend**
    From the `backend/` directory:

    ```sh
    # Apply database migrations
    npx prisma migrate dev

    # Start the dev server
    npm run dev
    ```

2.  **Run the Frontend**
    From the `frontend/` directory (in a new terminal):

    ```sh
    npm run dev
    ```

---

## 🚀 Build & Deployment

### 🗄️ Backend (Render)

1.  Create a new "Web Service" on Render and connect your repository.
2.  Set the **Build Command**:
    ```sh
    npm install && npx prisma generate && npx prisma migrate deploy
    ```
3.  Set the **Start Command**:
    ```sh
    npm run start
    ```
4.  Add your environment variables (from `backend/.env`) in the Render dashboard.

### 🌐 Frontend (Vercel)

1.  Create a new project on Vercel and connect your repository.
2.  Select **Vite** as the framework preset.
3.  Set the **Root Directory** to `frontend`.
4.  Add the `VITE_API_URL` environment variable, pointing to your live backend URL (e.g., `https://your-backend-url.onrender.com/api/v1`).
5.  Deploy.

### ✅ Deployment Checklist

- [ ] Environment variables configured in Render + Vercel
- [ ] PostgreSQL provisioned (e.g., Render, Neon, Supabase)
- [ ] `npx prisma migrate deploy` has been run successfully
- [ ] CORS configured in `backend/app.js` for frontend domain
- [ ] Build commands verified in Render/Vercel logs
- [ ] HTTPS enabled (automatic with Render/Vercel)

---

## 🧠 API Overview

### Auth

| Method | Endpoint                | Description           |
| :----- | :---------------------- | :-------------------- |
| `POST` | `/api/v1/auth/register` | Register new user     |
| `POST` | `/api/v1/auth/login`    | Login user            |
| `GET`  | `/api/v1/auth/me`       | Get current user info |

### Contacts

| Method   | Endpoint               | Description      |
| :------- | :--------------------- | :--------------- |
| `GET`    | `/api/v1/contacts`     | Get all contacts |
| `POST`   | `/api/v1/contacts`     | Add new contact  |
| `PATCH`  | `/api/v1/contacts/:id` | Update contact   |
| `DELETE` | `/api/v1/contacts/:id` | Delete contact   |

### Notifications

| Method   | Endpoint                              | Description            |
| :------- | :------------------------------------ | :--------------------- |
| `GET`    | `/api/v1/notifications`               | Get user notifications |
| `PATCH`  | `/api/v1/notifications/:id/read`      | Mark as read           |
| `PATCH`  | `/api/v1/notifications/mark-all-read` | Mark all as read       |
| `DELETE` | `/api/v1/notifications/:id`           | Delete notification    |

---

## 🗄️ Common Prisma Commands

| Purpose                     | Command                                          |
| :-------------------------- | :----------------------------------------------- |
| **Generate client**         | `npx prisma generate`                            |
| **Create migration (dev)**  | `npx prisma migrate dev --name <migration_name>` |
| **Apply migrations (prod)** | `npx prisma migrate deploy`                      |
| **Reset database (dev)**    | `npx prisma migrate reset`                       |
| **View DB in browser**      | `npx prisma studio`                              |

---

## 🧑‍💻 Contributing

Contributions are welcome\! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m "Add feature"`).
4.  Push to your branch (`git push origin feature/your-feature`).
5.  Open a pull request.

---

## 📸 Screenshots

![Home Page](screenshot/home.png)
![Dashboard](screenshot/dashboard.png)
![Contacts Page](screenshot/contact.png)
![Deals Page](screenshot/deals.png)
![Tasks Page](screenshot/tasks.png)

## 🪪 License

This project is licensed under the MIT License — you are free to use, modify, and distribute with attribution.

---

## 📧 Contact

For support or collaboration:

- **Email**: `mahendrakrsahu9@gmail.com`
- **GitHub**: `[@mahi-in9](https://github.com/mahi-in9)`

<!-- end list -->

```

```
