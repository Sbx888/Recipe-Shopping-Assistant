#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
required_vars=("MONGODB_URI" "JWT_SECRET" "NODE_ENV")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done

# Install dependencies
echo "Installing backend dependencies..."
npm install --production

echo "Installing frontend dependencies..."
cd client
npm install --production
cd ..

# Run tests
echo "Running tests..."
npm test

# Build frontend
echo "Building frontend..."
cd client
npm run build
cd ..

# Create deployment directory
deploy_dir="deploy"
echo "Creating deployment directory..."
rm -rf $deploy_dir
mkdir -p $deploy_dir

# Copy backend files
echo "Copying backend files..."
cp -r \
  package.json \
  package-lock.json \
  server.js \
  models \
  routes \
  services \
  middleware \
  $deploy_dir/

# Copy frontend build
echo "Copying frontend build..."
mkdir -p $deploy_dir/client/build
cp -r client/build/* $deploy_dir/client/build/

# Copy environment variables
echo "Copying environment configuration..."
cp .env $deploy_dir/

# Create production configuration
cat > $deploy_dir/ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'recipe-shopping-assistant',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3005
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
EOL

# Create deployment instructions
cat > $deploy_dir/README.md << EOL
# Recipe Shopping Assistant Deployment

## Prerequisites
- Node.js 14+ and npm
- MongoDB 4.4+
- PM2 (npm install -g pm2)

## Setup
1. Install dependencies:
   \`\`\`
   npm install --production
   \`\`\`

2. Set up environment variables in .env file:
   - MONGODB_URI
   - JWT_SECRET
   - NODE_ENV=production
   - PORT (optional, defaults to 3005)

3. Start the application:
   \`\`\`
   pm2 start ecosystem.config.js --env production
   \`\`\`

4. Monitor the application:
   \`\`\`
   pm2 monit
   \`\`\`

## Maintenance
- View logs: \`pm2 logs\`
- Restart app: \`pm2 restart recipe-shopping-assistant\`
- Stop app: \`pm2 stop recipe-shopping-assistant\`
EOL

# Create nginx configuration template
cat > $deploy_dir/nginx.conf << EOL
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/recipe-shopping-assistant/client/build;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Create deployment archive
echo "Creating deployment archive..."
tar -czf recipe-shopping-assistant.tar.gz -C $deploy_dir .
rm -rf $deploy_dir

echo "Deployment package created: recipe-shopping-assistant.tar.gz"
echo "Deployment complete!" 