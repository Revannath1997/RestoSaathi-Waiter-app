# RestoSaathi Waiter App - Complete Files Guide

This document describes all files in the RestoSaathi Waiter App project.

## Project Root

### Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL database container configuration |
| `init.sql` | Database initialization script with sample data |
| `.gitignore` | Git ignore patterns for entire project |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete project documentation, features, and API reference |
| `SETUP.md` | Quick 20-minute setup guide for development |
| `FILES_GUIDE.md` | This file - complete file structure documentation |

---

## Backend Directory (`/backend`)

### Main Application Files

| File | Purpose | Key Components |
|------|---------|-----------------|
| `server.js` | Express.js server setup | CORS, middleware, routing |
| `package.json` | Backend dependencies and scripts | npm scripts, dependencies list |
| `.env.example` | Environment variables template | Database URL, JWT secret, port |
| `.gitignore` | Backend-specific git ignore patterns | node_modules, .env, logs |

### Routes (`/backend/routes`)

| File | Purpose | Endpoints |
|------|---------|-----------|
| `auth.js` | Authentication handlers | /generate-waiter-code, /signup, /login, /verify |
| `orders.js` | Order management | /create, /:orderId, /pending, /:orderId/status, /:orderId/send-to-kitchen |
| `menu.js` | Menu and OCR processing | /upload, /process/:uploadId, /restaurant/:restaurantId, /processing/:processingId |
| `notifications.js` | Order notifications | /order/:orderId, /unread, /:notificationId/read, /branch/:branchId/summary |

### Database (`/backend/prisma`)

| File | Purpose | Contains |
|------|---------|----------|
| `schema.prisma` | Prisma ORM database schema | Database provider, models, relationships, indexes |

**Database Models**:
- **Restaurant**: Restaurant details
- **Branch**: Restaurant branches
- **Waiter**: Waiter profiles and authentication
- **WaiterSignupCode**: One-time signup codes
- **WaiterSession**: Active waiter sessions
- **MenuItem**: Menu items with pricing
- **Table**: Restaurant tables
- **Order**: Order information and status
- **OrderItem**: Individual items in orders
- **OrderNotification**: Order updates
- **MenuCardUpload**: Uploaded menu card images
- **MenuProcessing**: OCR processing records
- **ProcessedMenuItem**: Extracted menu items from OCR

### Root Node Modules (Backend)

**Key Dependencies**:
- `express`: Web framework
- `@prisma/client`: ORM for database
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Password hashing
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `multer`: File upload handling
- `body-parser`: Request body parsing

---

## Frontend Directory (`/frontend`)

### Main Application Files

| File | Purpose | Key Components |
|------|---------|-----------------|
| `App.js` | Root navigation component | Auth/App stack, navigation setup, token persistence |
| `package.json` | Frontend dependencies | React Native, Expo, navigation, HTTP client |
| `app.json` | Expo configuration | App name, version, permissions, plugins |
| `.env.example` | Environment variables template | API URL configuration |
| `.gitignore` | Frontend-specific git ignore | node_modules, .env, Expo cache |

### Screens (`/frontend/screens`)

#### Authentication Screens

| File | Purpose | Features |
|------|---------|----------|
| `LoginScreen.js` | Waiter login | Phone/password auth, create account link |
| `SignupScreen.js` | Waiter registration | Manager code validation, account creation |

#### Menu Management Screens

| File | Purpose | Features |
|------|---------|----------|
| `MenuUploadScreen.js` | Menu card capture | Camera/gallery, image selection, upload |
| `MenuProcessingScreen.js` | OCR results | Item list, selection, category grouping |

#### Order Management Screens

| File | Purpose | Features |
|------|---------|----------|
| `OrderEntryScreen.js` | Order selection | Menu browsing, quantity control, table entry |
| `VoiceOrderScreen.js` | Voice-based ordering | Recording simulation, text display |
| `OrderConfirmationScreen.js` | Order review | Summary, special notes, final confirmation |
| `OrderStatusScreen.js` | Real-time tracking | Status timeline, notifications, activity log |

### Root Node Modules (Frontend)

**Key Dependencies**:
- `react-native`: Mobile framework
- `expo`: Development framework
- `react-navigation`: Navigation library
- `axios`: HTTP client
- `@react-native-async-storage/async-storage`: Local storage
- `expo-camera`: Camera access
- `expo-image-picker`: Image selection
- `expo-voice`: Voice recording (simulated)
- `react-native-toast-message`: Notifications

---

## Database Schema Overview

```
Restaurant (1) ─── (M) Branch
    │
    ├─── (M) WaiterSignupCode
    ├─── (M) MenuItem
    ├─── (M) Order
    └─── (M) MenuCardUpload

Branch (1) ─── (M) Waiter
    │
    └─── (M) Table

Waiter (1) ─── (M) Order
    │
    ├─── (M) WaiterSession
    └─── (M) MenuCardUpload

MenuItem (1) ─── (M) OrderItem
    └─── (M) ProcessedMenuItem

MenuCardUpload (1) ─── (M) MenuProcessing

MenuProcessing (1) ─── (M) ProcessedMenuItem

Order (1) ─── (M) OrderItem
    └─── (M) OrderNotification

Table (1) ─── (M) Order
```

---

## API Endpoint Structure

### Base URLs
- **Backend API**: `http://localhost:3000/api/v1`
- **Frontend**: `http://localhost:19000` (Expo)

### Authentication Endpoints
```
POST /auth/generate-waiter-code
POST /auth/signup
POST /auth/login
POST /auth/verify
```

### Order Endpoints
```
POST /orders/create
GET /orders/:orderId
GET /orders/pending
PUT /orders/:orderId/status
POST /orders/:orderId/send-to-kitchen
```

### Menu & OCR Endpoints
```
POST /menu/upload
POST /menu/process/:uploadId
GET /menu/restaurant/:restaurantId
GET /menu/item/:itemId
GET /menu/processing/:processingId
```

### Notification Endpoints
```
GET /notifications/order/:orderId
GET /notifications/unread
POST /notifications/:notificationId/read
POST /notifications/waiter/read-all
GET /notifications/branch/:branchId/summary
GET /notifications/stream/:orderId
```

---

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/resto_waiter"

# Authentication
JWT_SECRET="your-super-secret-key-12345-change-this"
JWT_EXPIRY="30d"

# Server
NODE_ENV="development"
PORT=3000
API_URL="http://localhost:3000"

# CORS
CORS_ORIGIN="http://localhost:19000,http://localhost:3000,http://192.168.1.100:19000"

# Logging
LOG_LEVEL="debug"

# Optional: Google Cloud (for future OCR integration)
GOOGLE_CLOUD_PROJECT_ID=""
GOOGLE_CLOUD_API_KEY=""
```

### Frontend (.env)

```env
API_URL="http://localhost:3000"
API_V1_URL="http://localhost:3000/api/v1"
ENVIRONMENT="development"
DEBUG="true"
LOG_LEVEL="debug"
```

---

## File Statistics

**Total Files**: 50+

**By Type**:
- Backend route files: 4
- Frontend screen files: 8
- Configuration files: 8
- Documentation files: 4
- Database files: 2
- Others: 24+

**Total Lines of Code**: 6,000+

**Directory Sizes**:
- Backend: ~2,000 LOC
- Frontend: ~3,500 LOC
- Docs: ~1,500 LOC

---

## Development Workflow

### File Creation Order
1. Backend setup (server.js, routes/)
2. Database schema (schema.prisma)
3. Frontend setup (App.js)
4. Authentication screens
5. Menu management screens
6. Order management screens
7. Documentation

### Key Modifications During Development

**Backend**:
1. Update `schema.prisma` for schema changes
2. Add routes in `/routes/` for new endpoints
3. Update `server.js` for new middleware
4. Modify `.env` for configuration

**Frontend**:
1. Add screens in `/screens/`
2. Update `App.js` for navigation
3. Modify `app.json` for Expo config
4. Update `.env` for API URLs

---

## Important File Relationships

```
Frontend → Backend API
├── App.js
│   ├── LoginScreen ──────→ /auth/login
│   ├── SignupScreen ─────→ /auth/signup
│   ├── MenuUploadScreen ──→ /menu/upload
│   ├── MenuProcessingScreen ──→ /menu/process
│   ├── OrderEntryScreen ──→ (data selection)
│   ├── OrderConfirmationScreen → /orders/create
│   ├── OrderStatusScreen ──→ /orders/:id (polling)
│   └── VoiceOrderScreen ──→ (data capture)
│
└── AsyncStorage (local persistence)
    ├── userToken
    ├── waiterId
    ├── branchId
    └── waiterName

Database (PostgreSQL)
├── Prisma Schema
│   └── schema.prisma
├── Migrations (auto-managed)
└── Seed Data (init.sql)
```

---

## Build & Deployment Files

- **Docker**: `docker-compose.yml`
- **Database Init**: `init.sql`
- **Git Control**: `.gitignore` (3 copies at different levels)
- **Package Managers**: `package.json` (2 copies for backend & frontend)

---

## Documentation Files Map

| File | Covers |
|------|--------|
| `README.md` | Full project docs, features, stack, API reference |
| `SETUP.md` | 20-minute quick setup guide |
| `FILES_GUIDE.md` | This file - complete file inventory |
| Backend `.env.example` | Backend configuration template |
| Frontend `.env.example` | Frontend configuration template |

---

## Testing Files Checklist

```bash
# Backend Files to Test
✓ backend/server.js          # Server setup
✓ backend/routes/auth.js     # Authentication
✓ backend/routes/orders.js   # Order management
✓ backend/routes/menu.js     # Menu processing
✓ backend/routes/notifications.js  # Notifications
✓ backend/prisma/schema.prisma     # Database schema

# Frontend Files to Test
✓ frontend/App.js            # Navigation
✓ frontend/screens/LoginScreen.js
✓ frontend/screens/SignupScreen.js
✓ frontend/screens/MenuUploadScreen.js
✓ frontend/screens/MenuProcessingScreen.js
✓ frontend/screens/OrderEntryScreen.js
✓ frontend/screens/VoiceOrderScreen.js
✓ frontend/screens/OrderConfirmationScreen.js
✓ frontend/screens/OrderStatusScreen.js

# Configuration Files
✓ docker-compose.yml         # Database setup
✓ backend/.env.example       # Backend config
✓ frontend/.env.example      # Frontend config
✓ init.sql                   # Sample data
```

---

## Next Steps

1. **Setup**: Follow `SETUP.md`
2. **Understand**: Read `README.md` 
3. **Explore**: Review specific files in this guide
4. **Customize**: Modify styling, branding, functionality
5. **Deploy**: Use production guides in `README.md`

---

## Quick File Lookup

**Need to add authentication?**
→ `backend/routes/auth.js`

**Need to customize order flow?**
→ `frontend/screens/OrderEntryScreen.js` & `OrderConfirmationScreen.js`

**Need to modify database?**
→ `backend/prisma/schema.prisma`

**Need to change UI styling?**
→ Individual screen files in `frontend/screens/`

**Need to add new API endpoint?**
→ Create/modify file in `backend/routes/`

**Need to change navigation?**
→ `frontend/App.js`

**Need to adjust server settings?**
→ `backend/server.js`

---

**Total Documentation**: Complete ✓
**All Files**: Present ✓
**Ready for Development**: Yes ✓
