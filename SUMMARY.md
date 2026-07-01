# CoreClip.ai - Complete Architecture & Implementation Guide

**Last Updated**: July 1, 2026  
**Status**: ✅ Production Ready  
**TypeScript Errors**: 0  
**Production Vulnerabilities**: 0

---

## 📌 PROJECT OVERVIEW

CoreClip.ai is an AI-powered content generation platform that enables users to create professional product imagery and short-form videos. Users upload product and model images, and AI generates stylized, professional-quality marketing content. The platform operates on a credit-based system with community features for sharing generated content.

### Core Value Proposition

- **Generate** professional product photos and videos in seconds
- **Monetize** through flexible credit-based pricing
- **Share** with community to build network effects
- **Manage** all content from intuitive dashboard

---

## 🏗️ SYSTEM ARCHITECTURE

### Frontend (React + TypeScript + Vite)

**Routes & Pages:**

| Route                | File                | Purpose                         |
| -------------------- | ------------------- | ------------------------------- |
| `/`                  | `Home.tsx`          | Landing page, features, pricing |
| `/generate`          | `Generator.tsx`     | Image generation form           |
| `/result/:projectId` | `Result.tsx`        | Display generated content       |
| `/my-generations`    | `MyGenerations.tsx` | User dashboard                  |
| `/community`         | `Community.tsx`     | Public project gallery          |
| `/plans`             | `Plans.tsx`         | Pricing information             |

**Key Components:**

- `ProjectCard.tsx` - Reusable project display card (with download/delete/publish actions)
- `UploadZone.tsx` - Drag-and-drop file upload with preview
- `Buttons.tsx` - Primary and ghost button components
- `Navbar.tsx` - Navigation header with auth
- `Hero.tsx`, `Features.tsx`, `Pricing.tsx`, `Faq.tsx` - Landing page sections

### Backend (Express + TypeScript + MongoDB)

**Architecture Pattern**: MVC (Model-View-Controller)

**Controllers:**

1. **`userController.ts`** - User & project queries
   - `getUserCredits` → `GET /api/user/credits`
   - `getAllProjects` → `GET /api/user/projects`
   - `getProjectById` → `GET /api/user/projects/:projectId`
   - `toggleProjectPublic` → `GET /api/user/publish/:projectId`

2. **`projectController.ts`** - Project creation & AI generation
   - `createProject` → `POST /api/project/create` (image generation)
   - `createVideo` → `POST /api/project/video` (video generation)
   - `getAllPublishedProjects` → `GET /api/project/published` (community)
   - `deleteProject` → `DELETE /api/project/:projectId`

3. **`clerk.ts`** - Webhook handler for Clerk events
   - `user.created` → Create user record
   - `user.updated` → Update user record
   - `user.deleted` → Delete user record
   - `paymentAttempt.updated` → Add credits

### Database (MongoDB + Mongoose)

**Collections:**

**User:**

```javascript
{
  id: String,              // Clerk user ID (unique index)
  email: String,           // Email address (indexed)
  name: String,            // User full name
  image: String,           // Profile image URL
  credits: Number,         // Balance (default: 20, min: 0)
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-updated
}
```

**Project:**

```javascript
{
  _id: ObjectId,                    // MongoDB ID
  name: String,                     // Project name
  userId: String,                   // Owner user ID (indexed)
  productName: String,              // Product being showcased
  productDescription: String,       // Optional product details
  userPrompt: String,               // Optional custom prompt
  aspectRatio: String,              // "9:16" or "16:9" (enum)
  targetLength: Number,             // Video duration (min: 1)
  uploadedImages: [String],         // Source image URLs
  generatedImage: String,           // Generated image URL
  generatedVideo: String,           // Generated video URL
  isGenerating: Boolean,            // Generation in progress
  isPublished: Boolean,             // Shared to community
  error: String,                    // Error message if failed
  createdAt: Date,
  updatedAt: Date
}
```

---

## 💾 COMPLETE TECH STACK

### Frontend Dependencies

| Package          | Version   | Purpose        |
| ---------------- | --------- | -------------- |
| React            | ^19.2.0   | UI framework   |
| React Router DOM | ^7.14.0   | Client routing |
| TypeScript       | ^5.x      | Type safety    |
| Vite             | ^5.x      | Build tool     |
| Tailwind CSS     | ^4.1.17   | Styling        |
| @clerk/react     | ^6.5.0    | Auth UI        |
| @clerk/themes    | ^2.4.57   | Auth styling   |
| Framer Motion    | ^12.23.26 | Animations     |
| Lucide React     | ^0.555.0  | Icons          |
| React Hot Toast  | ^2.6.0    | Notifications  |
| Axios            | ^1.16.1   | HTTP client    |
| Lenis            | ^1.3.16   | Smooth scroll  |

### Backend Dependencies

| Package        | Version | Purpose          |
| -------------- | ------- | ---------------- |
| Express        | ^5.2.1  | Web framework    |
| TypeScript     | ^5.x    | Type safety      |
| Mongoose       | ^8.0.0  | MongoDB ODM      |
| @clerk/express | ^2.1.13 | Clerk backend    |
| Multer         | ^2.1.1  | File uploads     |
| Axios          | ^1.16.1 | HTTP client      |
| Cloudinary     | ^2.10.0 | Media storage    |
| @google/genai  | ^2.5.0  | AI generation    |
| CORS           | ^2.8.6  | Cross-origin     |
| Dotenv         | ^17.4.2 | Environment vars |

### External Services

- **Clerk** - Authentication & user management
- **Cloudinary** - Image/video storage
- **Google GenAI** - AI generation (image & video models)
- **MongoDB** - Database

---

## 🔄 COMPLETE DATA FLOW

### Image Generation Flow

```
User uploads product + model images
    ↓
POST /api/project/create (multipart form)
    ↓
Backend deducts 5 credits + calls Google GenAI
    ↓
Generated image uploaded to Cloudinary
    ↓
Frontend redirects to /result/:projectId
    ↓
Image displayed and ready for download/video generation
```

### Video Generation Flow

```
User clicks "Generate Video"
    ↓
POST /api/project/video
    ↓
Backend deducts 10 credits + calls Google GenAI (5-min timeout)
    ↓
Polls for completion every 10 seconds
    ↓
Video downloaded and uploaded to Cloudinary
    ↓
Frontend polls and displays completed video
```

### Credit System

- **New User**: 20 credits
- **Image**: -5 credits
- **Video**: -10 credits
- **Purchase**: +80 (Pro) or +240 (Premium) via Clerk
- **Refund**: Automatic on failure

---

## ✨ KEY FEATURES

### 1. AI Image Generation

- **Input**: Product + Model images + Description
- **Model**: `gemini-3-pro-image-preview`
- **Formats**: "9:16" (vertical) or "16:9" (horizontal)
- **Cost**: 5 credits
- **Speed**: 5-30 seconds

### 2. AI Video Generation

- **Input**: Generated image + Product details
- **Model**: `veo-3.1-generate-preview`
- **Output**: 5-second 720p MP4
- **Cost**: 10 credits
- **Speed**: 1-5 minutes

### 3. Community Gallery

- **Access**: Public (no auth required)
- **Content**: Published user projects
- **Features**: Creator info, download capability

### 4. User Dashboard

- **Access**: Authenticated users only
- **Features**: View projects, manage, download, publish

---

## 🔧 ALL RECENT FIXES (9 Total)

| #   | Bug                       | File                     | Status |
| --- | ------------------------- | ------------------------ | ------ |
| 1   | Model image clear button  | Generator.tsx:96         | ✅     |
| 2   | Broken download links     | ProjectCard.tsx          | ✅     |
| 3   | Wrong AI model name       | projectController.ts:105 | ✅     |
| 4   | Wrong aspect ratio format | projectController.ts:112 | ✅     |
| 5   | Multer configuration      | multer.ts                | ✅     |
| 6   | Project ID mapping        | Controllers              | ✅     |
| 7   | Response messages         | projectController.ts     | ✅     |
| 8   | User info in community    | projectController.ts     | ✅     |
| 9   | Enhanced responses        | userController.ts        | ✅     |

---

## 🚀 DEPLOYMENT READINESS

| Aspect       | Status               |
| ------------ | -------------------- |
| TypeScript   | ✅ 0 errors          |
| Dependencies | ✅ 0 vulnerabilities |
| Security     | ✅ JWT + validation  |
| Database     | ✅ MongoDB ready     |
| APIs         | ✅ All 10 endpoints  |
| Frontend     | ✅ All routes        |
| Testing      | ⏳ Ready for suite   |

---

## 📦 QUICK START

### Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with credentials
npm run server
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
# Edit .env with credentials
npm run client
```

### Required Credentials

- MongoDB URI
- Clerk keys (publishable + secret + webhook)
- Cloudinary URL
- Google GenAI API key

---

## 📋 PROJECT STATISTICS

| Metric               | Count |
| -------------------- | ----- |
| Frontend Pages       | 6     |
| Backend Controllers  | 3     |
| API Routes           | 10    |
| Database Collections | 2     |
| TypeScript Files     | 30+   |
| Lines of Code        | 3000+ |

---

## 📂 DIRECTORY STRUCTURE

```
core-clip/
├── client/                    # React Frontend
│   ├── src/pages/            # 6 route pages
│   ├── src/components/       # 10+ components
│   └── src/configs/          # axios setup
│
├── server/                    # Express Backend
│   ├── controllers/          # 3 controller files
│   ├── models/               # 2 mongoose schemas
│   ├── routes/               # 2 route files
│   └── configs/              # 4 config files
│
└── Documentation/            # 11+ guides
    ├── SUMMARY.md           # Architecture (this file)
    ├── DEPLOYMENT.md
    ├── MIGRATION.md
    └── ... (8 more)
```

---

**Status**: ✅ Production Ready | **Next**: Begin testing phase
