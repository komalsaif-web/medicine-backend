# 💊 Medicine & User Management API

This is a Node.js + Express backend for managing user authentication, feedback, Google OAuth login, medicine products, purchases, and ratings. It uses MongoDB (via Mongoose) and supports image uploads with `multer`.

---

## 🚀 Features

- User authentication (signup, login, OTP verification, password reset)
- Google OAuth login
- User profile management
- Medicine product CRUD with image uploads
- Purchase tracking with receipt uploads
- Feedback submission & viewing
- Rating system with average calculation
- Admin routes for managing all users, feedback, and products

---

## 📦 API Endpoints

### 🧑‍💼 Auth Routes (`/api/auth`)
| Method | Route                      | Description                          |
|--------|----------------------------|--------------------------------------|
| POST   | `/signup`                  | Register a new user                  |
| POST   | `/send-otp`                | Send OTP for verification            |
| POST   | `/verify-otp`              | Verify OTP code                      |
| POST   | `/login`                   | User login                           |
| POST   | `/forgot-password`         | Send reset link/code                 |         
| GET    | `/get-user/:id`        | Get user details                     |
| DELETE | `/delete-user/:id`         | Delete user account                  |
| POST   | `/resend-otp`              | Resend OTP to user                   |
| GET    | `/get-user-by-email/:email`| Get user by email                    |
| GET    | `/get-all-users`           | Get all users                        |
| DELETE | `/delete-all-users`        | Delete all users (admin use)         |
| Update | `/update-user/:id`         | Update all users (admin use)         |


---

### 🌐 Google Auth Routes (`/api/google`)
| Method | Route            | Description                  |
|--------|------------------|------------------------------|
| POST   | `/google`        | Login/Register Google user   |
| GET    | `/google/:id`    | Get Google user by ID        |

---

### 💊 Medicine/Product Routes (`/api`)
| Method | Route                          | Description                              |
|--------|--------------------------------|------------------------------------------|
| POST   | `/products`                    | Create product (with image)              |
| GET    | `/products`                    | Get all products                         |
| GET    | `/products/user/:user_id`      | Get products by user                     |
| PUT    | `/products/:id`                | Update product by ID                     |
| DELETE | `/products/:id`                | Delete product by ID                     |

---

### 🧾 Purchase Routes (`/api`)
| Method | Route                        | Description                              |
|--------|------------------------------|------------------------------------------|
| POST   | `/purchase/add`              | Add a purchase with receipt image        |
| GET    | `/purchase/all`              | Get all purchases                        |
| GET    | `/purchase/:userId`          | Get purchases for a specific user        |

---

### 📢 Feedback Routes (`/api`)
| Method | Route                | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/feedback`          | Submit feedback                 |
| GET    | `/feedback/:id`      | Get feedback by ID              |
| GET    | `/all-feedback`      | Get all feedback entries        |

---

### ⭐ Rating Routes (`/api`)
| Method | Route                | Description                           |
|--------|----------------------|---------------------------------------|
| POST   | `/rating`            | Submit a rating                       |
| GET    | `/rating/:id`        | Get a user's rating                   |
| GET    | `/rating/average`    | Get average rating                    |
| GET    | `/all-rating`        | Get all ratings                       |

---

