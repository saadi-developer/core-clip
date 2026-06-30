# CoreClip.ai - Deployment & Setup Guide

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)
- Cloudinary account (for image/video storage)
- Google Cloud account with GenAI API enabled

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd core-clip
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env

# Update .env with your credentials:
# - MONGODB_URI: MongoDB connection string
# - CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SIGNING_SECRET
# - CLOUDINARY_URL: Your Cloudinary URL
# - GOOGLE_CLOUD_API_KEY: Google GenAI API key
# - PORT: (optional, defaults to 5000)

# Start the development server
npm run server
```

The server will run at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env

# Update .env with your credentials:
# - VITE_BASEURL: Backend API URL (http://localhost:5000 for local dev)
# - VITE_CLERK_PUBLISHABLE_KEY: Your Clerk publishable key

# Start the development server
npm run client
```

The frontend will run at `http://localhost:5173`

## Environment Variables

### Client (.env)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BASEURL=http://localhost:5000
```

### Server (.env)

```
MONGODB_URI=mongodb+srv://...
PORT=5000
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
CLOUDINARY_URL=cloudinary://...
GOOGLE_CLOUD_API_KEY=...
CLIENT_URL=http://localhost:5173 (development)
```

## Database Setup (MongoDB)

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get the connection string
4. Add to `.env` as `MONGODB_URI`

### Option 2: Local MongoDB (Development)

```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Windows: Download from https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# Connection string: mongodb://localhost:27017/coreclip
```

## Clerk Setup

1. Create account at https://clerk.com
2. Create a new application
3. Copy the publishable and secret keys to `.env`
4. Setup webhook:
   - Go to Webhooks in Clerk dashboard
   - Add endpoint: `https://yourdomain.com/api/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`, `paymentAttempt.updated`

## Cloudinary Setup

1. Create account at https://cloudinary.com
2. Go to Dashboard > Settings > Copy CLOUDINARY_URL
3. Add to server `.env`

## Google GenAI Setup

1. Create account at https://cloud.google.com
2. Enable GenAI API
3. Create API key
4. Add to server `.env` as `GOOGLE_CLOUD_API_KEY`

## Building for Production

### Backend

```bash
cd server
npm run build
# Output: dist/server.js
```

### Frontend

```bash
cd client
npm run build
# Output: dist/
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables (VITE\_\*)
4. Deploy

#### Backend (Railway/Render)

1. Connect repository
2. Add environment variables (MONGODB*URI, CLERK*\*, etc.)
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`

### Option 2: Docker

Create `Dockerfile` for backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t coreclip-backend .
docker run -e MONGODB_URI=... -e CLERK_SECRET_KEY=... -p 5000:5000 coreclip-backend
```

## API Endpoints

All API endpoints require authentication (Clerk token in Authorization header) except:

- `GET /api/project/published` - public (published projects)
- `POST /api/clerk` - webhook only

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#6-api-routes) for full API documentation.

## Troubleshooting

### MongoDB Connection Issues

- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
- Test locally: `mongodb://localhost:27017/coreclip`

### Clerk Issues

- Verify keys in `.env`
- Check Clerk dashboard for user sync status
- Ensure webhook is configured correctly

### Cloudinary Issues

- Test URL format: `cloudinary://key:secret@cloud_name`
- Verify upload permissions in dashboard

### AI Generation Timeouts

- Video generation can take 2-5 minutes
- Ensure GOOGLE_CLOUD_API_KEY has proper quota
- Check Google Cloud console for API usage

## Database Schemas

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#5-database-schema) for detailed schema documentation.

## Support

For issues or questions, check the project documentation or open an issue on GitHub.
