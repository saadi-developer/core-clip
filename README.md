# CoreClip.ai - Generate Short Video Ads via AI

Create professional marketing videos and product imagery in seconds using AI. Simply upload sample and product images, and CoreClip.ai generates high-quality ad content optimized for social media, commercials, and personal branding.

## ✨ Features

- **AI Image Generation**: Combine product and model images to create professional product shots
- **AI Video Generation**: Transform static images into engaging short-form videos
- **Credit-Based System**: Flexible pricing with credit consumption (5 credits for images, 10 for videos)
- **Community Gallery**: Share and discover AI-generated content
- **User Dashboard**: Manage your generations with download and publish options
- **Instant Generation**: Results ready in seconds to minutes

## 🛠 Tech Stack

### Frontend

- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Clerk for authentication
- Framer Motion for animations
- React Router for navigation

### Backend

- Express.js server
- MongoDB with Mongoose (migrated from Postgres/Prisma)
- Google GenAI for image/video generation
- Cloudinary for asset storage
- Clerk webhook integration

### Database

- MongoDB Atlas (recommended for production)
- MongoDB local (for development)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Clerk account
- Cloudinary account
- Google Cloud GenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd core-clip
   ```

2. **Backend Setup**

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run server
   ```

   Server runs at `http://localhost:5000`

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run client
   ```
   Frontend runs at `http://localhost:5173`

## 📁 Project Structure

```
core-clip/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Route views (Home, Generator, Result, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── configs/       # Axios API configuration
│   │   ├── types/         # TypeScript interfaces
│   │   └── assets/        # Images and static assets
│   ├── vite.config.ts
│   └── package.json
│
├── server/                 # Express backend
│   ├── controllers/       # API route handlers
│   ├── models/            # Mongoose schemas (User, Project)
│   ├── routes/            # Express routes
│   ├── configs/           # Configuration (MongoDB, AI, multer)
│   ├── middlewares/       # Auth middleware
│   ├── types/             # TypeScript definitions
│   ├── server.ts          # Server entry point
│   └── package.json
│
├── DEPLOYMENT.md          # Deployment guide
├── MIGRATION.md           # Prisma to MongoDB migration guide
└── PROJECT_CONTEXT.md     # Comprehensive project documentation
```

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[MIGRATION.md](./MIGRATION.md)** - Database migration details
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Complete technical documentation

## 🔧 Environment Variables

### Client

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_BASEURL=http://localhost:5000
```

### Server

```
MONGODB_URI=mongodb+srv://username:password@cluster/coreclip
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SIGNING_SECRET=your_webhook_secret
CLOUDINARY_URL=cloudinary://key:secret@cloud
GOOGLE_CLOUD_API_KEY=your_genai_api_key
```

See `.env.example` in each directory for complete details.

## 🐛 Recent Fixes

- Fixed `aspectRatio` field name typo in Generator form submission
- Fixed `/api/projects/video` endpoint path (was `/api/project/video`)
- Fixed `req.body()` invocation error in video controller
- Fixed `/api/project/published` route authentication (now public)
- Complete migration from PostgreSQL + Prisma to MongoDB + Mongoose

## 📊 Database Schema

### User Model

- `id`: Clerk user ID (unique index)
- `email`: User email (indexed)
- `name`: User full name
- `image`: Profile image URL
- `credits`: User balance (min: 0, default: 20)
- `createdAt`, `updatedAt`: Timestamps

### Project Model

- `userId`: Owner ID (indexed)
- `name`, `productName`, `productDescription`
- `userPrompt`: Custom generation prompt
- `aspectRatio`: "9:16" or "16:9" (enum)
- `uploadedImages`: Source image URLs
- `generatedImage`: Generated image URL
- `generatedVideo`: Generated video URL
- `isGenerating`: Processing state (indexed)
- `isPublished`: Community visibility (indexed)
- `error`: Generation error message
- `createdAt`, `updatedAt`: Timestamps

## 🔌 API Endpoints

All endpoints require Clerk authentication (except public endpoints).

### User Routes

- `GET /api/user/credits` - Get user credit balance
- `GET /api/user/projects` - Get all user projects
- `GET /api/user/projects/:projectId` - Get single project
- `GET /api/user/publish/:projectId` - Toggle project visibility

### Project Routes

- `POST /api/project/create` - Create and generate image (5 credits)
- `POST /api/project/video` - Generate video (10 credits)
- `GET /api/project/published` - Get published projects (public)
- `DELETE /api/project/:projectId` - Delete project

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#6-api-routes) for full details.

## 🎬 Generation Flow

1. **User uploads images** → Product and model images
2. **Backend validates** → Checks credits and files
3. **Google GenAI generates** → Creates composite product image
4. **Cloudinary stores** → Image uploaded and URL saved
5. **Database updates** → Project marked complete
6. **User optionally generates video** → Same flow for video

## 💳 Pricing Model

- **Image Generation**: 5 credits
- **Video Generation**: 10 credits
- **Starting Credits**: 20 free credits per user
- **Upgrade Plans**:
  - Pro: +80 credits
  - Premium: +240 credits

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- MongoDB setup instructions
- Clerk webhook configuration
- Vercel + Railway deployment
- Docker containerization

## 🔐 Security

- Clerk handles user authentication
- Protected API routes via auth middleware
- MongoDB connection with SSL/TLS
- Environment variables for sensitive data
- CORS configured for authorized origins

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## 📝 License

ISC

## 🆘 Troubleshooting

### MongoDB Connection Issues

- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Test with: `mongodb://localhost:27017/coreclip` (local dev)

### Clerk Webhook Issues

- Verify webhook secret in `.env`
- Check Clerk dashboard for webhook logs
- Ensure webhook endpoint is accessible

### AI Generation Timeouts

- Video generation takes 2-5 minutes
- Verify Google Cloud API quota
- Check network connectivity

### Port Already in Use

- Backend: `lsof -i :5000` then `kill <PID>`
- Frontend: `lsof -i :5173` then `kill <PID>`

## 📞 Support

For issues or questions:

1. Check [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for detailed docs
2. Review error messages in server/browser console
3. Check MongoDB/Clerk/Cloudinary dashboards
4. Open an issue on GitHub

---

**CoreClip.ai** - Transform product images into viral video content with AI.
