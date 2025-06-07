# Recipe Shopping Assistant - Setup Guide

## Project Status (Last Updated: 2025-06-07)
- Frontend (Vue.js): Running on port 5173
- Backend (Node.js): Needs configuration
- Database: MongoDB running on localhost:27017

## Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/Sbx888/Recipe-Shopping-Assistant.git
   cd Recipe-Shopping-Assistant
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Configure environment variables:
   Create a `.env` file in the `server` directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_ORG_ID=your_openai_org_id_here
   MODEL=gpt-4-1106-preview
   MONGODB_URI=mongodb://localhost/recipe-assistant
   PORT=3005
   ```

4. Start the servers:
   - Frontend: `npm run client`
   - Backend: `npm run dev`

## Current Directory Structure
```
Recipe-Shopping-Assistant/
├── client/               # Vue.js frontend
│   ├── src/             # Frontend source code
│   └── package.json     # Frontend dependencies
├── server/              # Node.js backend
│   ├── src/            # Backend source code
│   │   └── server.js   # Main server file
│   └── package.json    # Backend dependencies
├── package.json        # Root project configuration
└── docs/              # Project documentation
```

## Known Issues
1. Backend server path resolution needs fixing
2. PowerShell command syntax issues with && operator
3. Frontend shows "Failed to load recipe" error

## Next Steps
1. Fix backend server.js path resolution
2. Set up proper error handling
3. Configure OpenAI integration
4. Test recipe parsing functionality

## Development Notes
- MongoDB Compass is installed and configured
- Frontend development server uses Vite
- Backend uses ES modules (type: "module" in package.json)

## Troubleshooting
If the server fails to start:
1. Check you're in the correct directory
2. Verify .env file exists and is properly configured
3. Ensure MongoDB is running
4. Check server/src/server.js exists and is properly configured

## Important Commands
- Install all dependencies: `npm run install-all`
- Start frontend: `npm run client`
- Start backend: `npm run dev`
- Start backend (production): `npm start`
- Push changes: `git add . && git commit -m "your message" && git push` 