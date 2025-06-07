# Maintenance Guide

## Daily Procedures

### 1. Code Organization
- Keep code organized in appropriate directories
- Follow the established structure:
  ```
  Recipe-Shopping-Assistant/
  ├── client/           # Frontend code
  ├── server/           # Backend code
  ├── docs/            # Documentation
  └── tests/           # Test files
  ```

### 2. Documentation Updates
Before ending your work session:
- Update `CHANGELOG.md` with any changes made
- Update `SETUP.md` if project status changed
- Update `DEVELOPMENT.md` if new issues/solutions found
- Add any new troubleshooting steps discovered

### 3. Git Procedures
After making changes:
```bash
git add .
git commit -m "descriptive message"
git push
```

## Backup Procedures

### 1. Code Backup
Your code is automatically backed up in multiple places:
- GitHub repository (main backup)
- Local Git repository
- Local working directory

### 2. Database Backup
For MongoDB:
1. Using MongoDB Compass:
   - Connect to your database
   - Export collections to BSON/JSON
   - Store in `backups/` directory

2. Using mongodump:
   ```bash
   mongodump --db recipe-assistant --out ./backups/$(date +%Y%m%d)
   ```

### 3. Environment Variables
Keep a secure backup of your `.env` files:
- Never commit to Git
- Store securely offline
- Document all required variables in `SETUP.md`

## Cleanup Procedures

### 1. Code Cleanup
- Remove unused imports
- Delete commented-out code
- Format code using Prettier
- Fix ESLint warnings
- Remove console.log statements

### 2. Dependencies Cleanup
Periodically:
```bash
# Remove unused dependencies
npm prune

# Update dependencies
npm update

# Check for vulnerabilities
npm audit
```

### 3. Git Cleanup
```bash
# Remove untracked files
git clean -n  # dry run
git clean -f  # actual removal

# Remove old branches
git branch -d old-branch

# Prune remote branches
git fetch -p
```

### 4. Database Cleanup
- Remove test data
- Clean up unused collections
- Optimize indexes
- Compact database if needed

## Emergency Procedures

### 1. Power Failure
Your work is safe because:
- Code is pushed to GitHub
- Local Git repository has commits
- MongoDB has auto-recovery

### 2. System Crash
To recover:
1. Pull latest code from GitHub
2. Restore MongoDB from backup
3. Check `.env` files
4. Run `npm install`
5. Test system

### 3. Corruption Recovery
If local files are corrupted:
```bash
# Reset local changes
git reset --hard origin/main

# Clean untracked files
git clean -fd

# Fresh install
npm run install-all
```

## Monitoring

### 1. System Health
- Check MongoDB connection
- Monitor API endpoints
- Watch for memory leaks
- Log error rates

### 2. Performance
- Frontend load times
- API response times
- Database query times
- Memory usage

### 3. Security
- Keep dependencies updated
- Monitor GitHub security alerts
- Review access logs
- Check API rate limits 