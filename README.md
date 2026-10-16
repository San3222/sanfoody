<div align="center">

# 🍔 SanFoody

### Full-Stack Food Delivery Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Fastify](https://img.shields.io/badge/Fastify-Latest-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)

**A production-ready food delivery platform inspired by Zomato & Swiggy.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [Demo Accounts](#-demo-accounts) · [Screenshots](#-screenshots)

</div>

---

## 📖 About

**SanFoody** is a full-stack food delivery platform with **4 role-based applications** — Customer, Restaurant Partner, Delivery Partner, and Admin — connected via **real-time Socket.io** events and powered by a **Fastify + MongoDB** backend.

Built end-to-end with modern tools, including **Razorpay payments**, **Wallet + Payouts**, **Loyalty Points**, **Gift Cards**, **Live Chat**, **Push Notifications**, and **Multi-City support**.

---

## ✨ Features

### 👤 Customer App

<table>
<tr>
<td width="50%">

- 🔍 Browse restaurants & menus
- 🔎 Search + smart filters
- 🛒 Cart with real-time totals
- 💳 Razorpay payment (Card/UPI/COD)
- 📍 Live order tracking (map)
- ⭐ Rate delivery + tips
- ❤️ Favorites & Wishlist
- 📦 Order history

</td>
<td width="50%">

- 💰 Wallet + Referrals
- 🏆 Loyalty points & tiers
- 🎁 Gift cards (buy/redeem)
- 💬 Live chat support
- 🔔 Push notifications
- 🌍 Multi-city selector
- 📱 Mobile-first responsive
- 🌙 Dark mode

</td>
</tr>
</table>

### 🏪 Restaurant Partner App

<table>
<tr>
<td width="50%">

- 📊 Live dashboard with stats
- 🔔 Sound alerts on new orders
- 📋 Order queue (accept/reject)
- 👨‍🍳 Preparing → Ready flow
- 🍴 Menu CRUD with images
- 📈 Analytics with charts

</td>
<td width="50%">

- ⭐ Reviews management
- ⚙️ Settings + availability toggle
- 🕐 Business hours
- 🚫 Reject with reason
- 🔄 Real-time Socket.io updates
- 📱 Push notifications

</td>
</tr>
</table>

### 🚴 Delivery Partner App

<table>
<tr>
<td width="50%">

- 📦 Available orders pool
- ✅ First-come-first-serve accept
- 🏍️ Confirm pickup → deliver
- 📍 Live location sharing
- 💰 Wallet auto-credit
- 💸 UPI / Bank payout setup

</td>
<td width="50%">

- 📊 Earnings chart + CSV export
- 🏆 Achievements & rewards
- ⭐ Rating system
- 🔔 Real-time notifications
- 📱 Mobile-first design
- 🟢 Online/offline toggle

</td>
</tr>
</table>

### 👑 Admin Panel

<table>
<tr>
<td width="50%">

- 📊 Real-time dashboard
- 👥 User management (block/activate)
- 🏪 Restaurant approvals
- ✅ Approve / Reject verification
- 📦 Order monitoring
- 💸 Payout approvals

</td>
<td width="50%">

- 📈 Platform analytics
- 💬 Chat support inbox
- ⚙️ Settings management
- 🔍 Search & filters
- 📄 Full user details view
- 🎯 Role-based access

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend

| Category | Technology |
|----------|-----------|
| **Framework** | React 19.2 |
| **Build Tool** | Vite 8 (Rolldown) |
| **Language** | TypeScript 6.0 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router 7 |
| **Server State** | TanStack Query 5 |
| **Animations** | Motion + GSAP |
| **Real-time** | Socket.io Client |
| **Maps** | Leaflet + React-Leaflet |
| **Icons** | Lucide React |
| **UI Utils** | class-variance-authority, clsx, tailwind-merge |

### Backend

| Category | Technology |
|----------|-----------|
| **Framework** | Fastify |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + Cookies |
| **Real-time** | Socket.io |
| **Payments** | Razorpay |
| **Push** | Web Push (VAPID) |
| **Email** | Resend |
| **Validation** | Zod |
| **Language** | TypeScript |

### DevOps & Testing

- **Testing:** Vitest, Testing Library, Playwright
- **Linting:** Oxlint
- **Git:** GitHub (main branch)

---

## 📁 Project Structure
sanfoody/
├── backend/ # Fastify API
│ ├── src/
│ │ ├── config/ # Env, database
│ │ ├── controllers/ # 30+ API controllers
│ │ ├── models/ # 20+ Mongoose models
│ │ ├── routes/ # 25+ route files
│ │ ├── middleware/ # Auth, error handling
│ │ ├── utils/ # ApiError, ApiResponse, email
│ │ ├── emails/ # HTML email templates
│ │ ├── server.ts # Server entry
│ │ ├── app.ts # Fastify app setup
│ │ └── seed.ts # Demo data seeder
│ └── package.json
│
├── frontend/ # React + Vite
│ ├── src/
│ │ ├── apps/ # 4 role-based apps
│ │ │ ├── customer/ # Customer app
│ │ │ ├── restaurant/ # Restaurant app
│ │ │ ├── delivery/ # Delivery app
│ │ │ └── admin/ # Admin panel
│ │ ├── api/ # API clients + hooks
│ │ ├── components/ # Shared + UI components
│ │ ├── context/ # Auth, Cart, Theme, etc.
│ │ ├── hooks/ # Custom hooks
│ │ ├── data/ # Mock/static data
│ │ └── lib/ # Utils & constants
│ └── package.json
│
├── .gitignore
├── package.json
└── README.md
