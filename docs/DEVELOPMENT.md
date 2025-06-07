# Development Guide

## Environment Setup

### Prerequisites
- Node.js v22.16.0 or higher
- MongoDB v7.0 or higher
- MongoDB Compass (optional, for database management)
- Git
- GitHub Desktop (optional, for GUI-based Git operations)

### Development Tools
- VS Code or Cursor IDE recommended
- Recommended VS Code extensions:
  - Vue Language Features
  - ESLint
  - Prettier
  - MongoDB for VS Code

### Environment Variables
Backend environment variables (`server/.env`):
```
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_openai_org_id
MODEL=gpt-4-1106-preview
MONGODB_URI=mongodb://localhost/recipe-assistant
PORT=3005
```

## Development Workflow

### Git Workflow
1. Create a new branch for each feature/fix
2. Make your changes
3. Test locally
4. Commit with descriptive messages
5. Push to GitHub
6. Create Pull Request

### Running the Project
1. Start MongoDB:
   - Ensure MongoDB is running on localhost:27017
   - MongoDB Compass can be used to view/edit data

2. Start the backend:
   ```bash
   cd server
   npm run dev
   ```

3. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

### Code Structure
- Frontend (Vue.js):
  - Components in `client/src/components`
  - Views in `client/src/views`
  - API calls in `client/src/services`

- Backend (Node.js):
  - Main server in `server/src/server.js`
  - Routes in `server/src/routes`
  - Services in `server/src/services`
  - Models in `server/src/models`

### Testing
- Frontend: Vue Test Utils
- Backend: Jest
- Run tests: `npm test` in respective directories

### Building for Production
1. Frontend:
   ```bash
   cd client
   npm run build
   ```

2. Backend:
   ```bash
   cd server
   npm start
   ```

## Troubleshooting

### Common Issues
1. Module not found:
   - Check working directory
   - Verify package.json
   - Run npm install

2. MongoDB connection:
   - Verify MongoDB is running
   - Check connection string
   - Check database permissions

3. PowerShell issues:
   - Use ; instead of && for command chaining
   - Run commands individually if needed 