# Manav Seva Codebase Guide for AI Agents

## Architecture Overview

This is a **three-tier MERN stack** application for managing a non-profit organization (Manav Seva). It consists of three independent projects:

- **`/admin`** – React+Vite admin dashboard (manages news, activities, gallery, reports, tenders, users)
- **`/client`** – React+Vite public-facing website with geographic data visualization (D3.js, TopoJSON)
- **`/server`** – Express.js REST API backend with MongoDB, JWT auth, and Cloudinary image uploads

**Critical Data Flow:**
1. Admin/Client apps make HTTP requests to `/api/*` endpoints via [admin/src/utils/api.js](admin/src/utils/api.js) (Axios with JWT interceptor)
2. Server routes requests to controllers → models → MongoDB
3. Images uploaded to Cloudinary via multer-storage-cloudinary in `uploadMiddleware.js`
4. Authentication uses JWT tokens stored in localStorage

## Project Setup & Build Commands

### Root Level
```bash
# Root package.json includes shared dependencies (d3, topojson, tailwind utilities)
```

### Admin Panel (http://localhost:5173)
```bash
cd admin
npm install
npm run dev      # Start dev server with HMR
npm run build    # Production build
npm run lint     # ESLint check
```

### Client (http://localhost:5174)
```bash
cd client
npm install
npm run dev      # Start dev server
npm run build    # Production build
```

### Server (http://localhost:5000)
```bash
cd server
npm install
npm run dev      # Start with nodemon (auto-restart on changes)
npm run start    # Production start
```

**Environment Setup:** Create `.env` in `/server` with:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000
```

## Key Architectural Patterns

### 1. **Frontend Authentication (Admin)**
- **Flow:** Login → JWT token stored in localStorage → Every API request includes `Authorization: Bearer {token}`
- **Implementation:** [admin/src/context/AuthContext.jsx](admin/src/context/AuthContext.jsx) + [admin/src/components/ProtectedRoute.jsx](admin/src/components/ProtectedRoute.jsx)
- **Token Injection:** Axios interceptor in [admin/src/utils/api.js](admin/src/utils/api.js) (lines 8-14) automatically adds Bearer token to all requests

### 2. **Server-side Route Protection**
- All mutation endpoints (POST/PUT/DELETE) use `authMiddleware` from [server/middleware/authMiddleware.js](server/middleware/authMiddleware.js)
- Validates JWT tokens before allowing state changes
- Example: [server/routes/newsRoutes.js](server/routes/newsRoutes.js) – GET is public, POST/PUT/DELETE require auth

### 3. **RESTful Resource Pattern**
- **Standard CRUD flow:** Controller (e.g., [server/controllers/newsController.js](server/controllers/newsController.js)) → Model (e.g., [server/models/News.js](server/models/News.js)) → Route (e.g., [server/routes/newsRoutes.js](server/routes/newsRoutes.js))
- **Admin Page Pattern:** Fetch data in `useEffect` → setState → render DataTable → handle edit/delete → call API → refetch
- **Example:** [admin/src/pages/ManageNews.jsx](admin/src/pages/ManageNews.jsx) (lines 1-40) shows this pattern in action

### 4. **Styling & UI Components**
- **Admin & Client:** Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **Vite Config:** [admin/vite.config.js](admin/vite.config.js) includes Tailwind plugin and SWC for fast compilation
- **Admin Components:** Reusable `DataTable` and `DashboardCard` in [admin/src/components/](admin/src/components/)
- **Client Icons:** lucide-react and react-icons for consistent iconography

### 5. **Image Handling**
- Admin uploads via multer → Cloudinary storage (configured in [server/config/cloudinary.js](server/config/cloudinary.js))
- Cloudinary returns secure URLs stored in MongoDB
- Public client fetches pre-stored image URLs (no upload capability)

### 6. **Geographic Data Visualization (Client)**
- Uses D3.js + TopoJSON for interactive India map
- Map data in [client/public/maps/INDIA_STATES.json](client/public/maps/INDIA_STATES.json)
- Backend stores geographic activities in `GeographicActivity` model

## Developer Workflows

### Adding a New Admin Management Page
1. Create model in `/server/models/YourModel.js` (schema definition)
2. Create controller in `/server/controllers/yourController.js` (CRUD logic)
3. Create route in `/server/routes/yourRoutes.js` (add authMiddleware for mutations)
4. Add API functions to [admin/src/utils/api.js](admin/src/utils/api.js)
5. Create page in [admin/src/pages/ManageYour.jsx](admin/src/pages/ManageYour.jsx) using DataTable pattern
6. Add route to [admin/src/routes/AppRoutes.jsx](admin/src/routes/AppRoutes.jsx)

### Testing API Changes
- Server runs on `:5000`, Admin on `:5173` (dev), Client on `:5174` (dev)
- Use Postman/Insomnia with `Authorization: Bearer {token}` header for protected routes
- Log database queries via MongoDB Atlas

### Debugging Frontend Issues
- Check browser DevTools > Network tab for API responses and CORS errors
- Auth token stored in localStorage – check DevTools > Application > Storage
- React DevTools extension helps inspect context state in AuthProvider

## Critical Integration Points

### API Base URL Configuration
- **Admin:** `http://localhost:5000/api` ([admin/src/utils/api.js](admin/src/utils/api.js) line 3)
- **Client:** Likely similar pattern (check [client/src/](client/src/) utils if it exists)
- **Production:** Must update to actual server domain before deployment

### MongoDB Collections & Relationships
- Collections: News, Tender, Gallery, Report, Activity, AdminActivity, GeographicActivity, User, etc.
- No explicit foreign keys – relationships stored as ObjectIds in subdocuments (e.g., ActivityPresence, GeographicActivityPresence)
- Update both related collections when modifying relationships

### Cross-Project Dependency: TODO List
- [TODO.md](TODO.md) tracks geographic map feature affecting both `ManageAbout.jsx` (admin) and `GeographicFocus.jsx` (client)
- Requires coordinated changes to backend model, admin UI, and client display

## Project-Specific Conventions

1. **Error Handling:** Controllers catch async errors and return appropriate HTTP status codes (400, 404, 500)
2. **Naming:** RESTful routes (`/api/news`, `/api/tenders`), controller functions named `getAll*`, `get*ById`, `create*`, `update*`, `delete*`
3. **Form Handling:** Admin pages use local state for form, reset after successful submission
4. **No TypeScript:** Pure JavaScript/JSX (consider for future refactoring)
5. **Async Patterns:** Async/await throughout (no promises chains or callbacks)

## Common Gotchas

- **CORS:** Backend must have CORS enabled for localhost:5173 and localhost:5174 (currently configured)
- **Token Expiration:** JWT tokens may expire; implement refresh logic if not present
- **Image URLs:** Cloudinary URLs are static; ensure they're cached appropriately
- **MongoDB Connection:** Ensure MONGO_URI in `.env` is correct and network is whitelisted in MongoDB Atlas
