# 🚀 Quick Start After Migration

## What Changed?

### 4 Critical Bugs Fixed ✅

1. **Generator.tsx**: `aspectRation` → `aspectRatio` (typo fixed)
2. **Result.tsx**: `/api/projects/video` → `/api/project/video` (endpoint fixed)
3. **projectController.ts**: `req.body()` → `req.body` (parsing fixed)
4. **projectRoutes.ts**: Removed auth from `/published` (public access fixed)

### Database Migration ✅

- **FROM**: PostgreSQL + Prisma
- **TO**: MongoDB + Mongoose
- **Connection**: Update `MONGODB_URI` instead of `DATABASE_URL`

---

## 📋 Setup (5 minutes)

### 1. Backend

```bash
cd server
npm install  # Installs mongoose, removes old Prisma deps
cp .env.example .env
# Edit .env with these values:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/coreclip
# CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
# CLOUDINARY_URL=cloudinary://...
# GOOGLE_CLOUD_API_KEY=...
npm run server
```

### 2. Frontend

```bash
cd ../client
npm install
cp .env.example .env
# Edit .env:
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# VITE_BASEURL=http://localhost:5000
npm run client
```

### 3. Open

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to `.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster-abc123.mongodb.net/coreclip
```

### Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# .env
MONGODB_URI=mongodb://localhost:27017/coreclip
```

---

## 🧪 Test It

```bash
# 1. User signup
# Go to frontend, click "Get Started", create account

# 2. Generate image
# Upload product + model images, click "Generate Image"

# 3. Check credits
# Click "Credits" button in navbar (should show 20 - 5 = 15)

# 4. Generate video
# Click "Generate Video" on result page (costs 10 credits)

# 5. Publish
# Go to "My Generations", click "Publish"

# 6. View community
# Go to "Community", see published projects
```

---

## 📁 File Structure Changes

### New Files

```
server/
  models/
    user.ts          ← User schema (new)
    project.ts       ← Project schema (new)
  .env.example       ← Environment template (new)
```

### Updated Files

```
server/
  configs/prisma.ts  ← MongoDB config (was Prisma config)
  controllers/       ← All migrated to Mongoose
  routes/            ← /published now public
  package.json       ← mongoose added, Prisma removed
```

### Deprecated Files

```
server/
  prisma.config.ts   ← No longer used (marked deprecated)
  prisma/            ← No longer used (can delete)
```

---

## 🔑 Environment Variables Needed

### Server `.env`

```
MONGODB_URI=mongodb+srv://user:password@cluster/coreclip
PORT=5000
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
CLOUDINARY_URL=cloudinary://key:secret@cloud
GOOGLE_CLOUD_API_KEY=...
CLIENT_URL=http://localhost:5173
```

### Client `.env`

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BASEURL=http://localhost:5000
```

---

## 🐛 Common Issues & Fixes

### "MongoDB connection failed"

```bash
# Check MONGODB_URI in .env
# For local: mongodb://localhost:27017/coreclip
# For Atlas: mongodb+srv://user:password@cluster.net/coreclip
```

### "Aspect ratio not saving"

✅ Already fixed! Generator now sends `aspectRatio` correctly.

### "Video endpoint 404"

✅ Already fixed! Changed from `/api/projects/video` to `/api/project/video`.

### "Community page shows 404"

✅ Already fixed! `/published` route is now public (no auth required).

### "Cannot read projectId"

✅ Already fixed! `req.body()` changed to `req.body`.

### "Port 5000 already in use"

```bash
lsof -i :5000
kill -9 <PID>
```

### "Module not found: mongoose"

```bash
cd server
npm install mongoose
```

---

## 📚 Documentation

Read these for more details:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production setup
- **[MIGRATION.md](./MIGRATION.md)** - What changed and why
- **[CHANGES.md](./CHANGES.md)** - Complete change log
- **[VERIFICATION.md](./VERIFICATION.md)** - Checklist
- **[README.md](./README.md)** - Project overview
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Full documentation

---

## ✨ Key Differences

### Query Syntax

**Before (Prisma)**:

```typescript
const user = await prisma.user.findUnique({ where: { id: userId } });
await prisma.user.update({
  where: { id },
  data: { credits: { increment: 5 } },
});
```

**After (Mongoose)**:

```typescript
const user = await User.findOne({ id: userId });
await User.findOneAndUpdate({ id }, { $inc: { credits: 5 } });
```

### Connection

**Before**:

```typescript
import { prisma } from "./configs/prisma.js";
```

**After**:

```typescript
import { connectDB } from "./configs/prisma.js";
import { User, Project } from "../models/";
await connectDB();
```

### TypeScript Interfaces

**Before**:

```typescript
const user = await prisma.user.findUnique(...);
// Type: User (auto-generated by Prisma)
```

**After**:

```typescript
import { IUser } from "../models/user.js";
const user = await User.findOne(...); // Type: IUser
```

---

## 🎯 What's Same

✅ **API endpoints** - All unchanged  
✅ **Response format** - All unchanged  
✅ **Frontend code** - Mostly unchanged (only bug fixes)  
✅ **Credit system** - Identical behavior  
✅ **Authentication** - Clerk integration unchanged  
✅ **AI generation** - Google GenAI integration unchanged  
✅ **File storage** - Cloudinary integration unchanged

---

## 🚀 Ready to Deploy?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- Vercel + Railway setup
- Docker containerization
- Production MongoDB Atlas
- Environment configuration
- Webhook setup
- CI/CD pipeline

---

## 💡 Pro Tips

1. **MongoDB Atlas IP Whitelist**
   - Add `0.0.0.0/0` for development
   - Restrict to specific IPs for production

2. **Indexes**
   - Already added for: userId, isGenerating, isPublished
   - Queries optimized automatically

3. **Connection Pool**
   - Mongoose handles it by default
   - 10 connections by default (enough for dev/small prod)

4. **Backups**
   - MongoDB Atlas auto-backups
   - Consider daily snapshots for production

5. **Monitoring**
   - Check MongoDB Atlas dashboard
   - Monitor query performance in logs
   - Set up alerts for connection failures

---

## ❓ Questions?

- Check [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for complete docs
- Review [CHANGES.md](./CHANGES.md) for detailed migration info
- See error logs: `npm run server` in terminal
- Check browser console: Frontend errors
- MongoDB Atlas logs: In dashboard

---

**Ready? Start with `npm install` in both directories!** 🎉
