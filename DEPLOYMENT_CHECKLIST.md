# 📋 Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.

---

## Pre-Deployment

### Code Preparation
- [ ] All code committed to git
- [ ] `.env` file is in `.gitignore` (don't commit secrets!)
- [ ] `.env.example` exists with sample values
- [ ] `render.yaml` exists in root directory
- [ ] `database-schema.sql` exists
- [ ] All tests passing locally
- [ ] Dynamic row expansion feature working locally

### GitHub Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Repository is public or Render has access
- [ ] Main branch is `main` or `master`

### Files to Verify
- [ ] `server/package.json` - has all dependencies
- [ ] `server/index.js` - server entry point
- [ ] `client/index.html` - frontend entry point
- [ ] `render.yaml` - deployment configuration
- [ ] `database-schema.sql` - database schema

---

## Render Setup

### Account & Database
- [ ] Render account created (https://render.com)
- [ ] GitHub connected to Render
- [ ] PostgreSQL database created
- [ ] Database status is "Available" (green)
- [ ] Database connection string copied
- [ ] Database schema initialized (ran `database-schema.sql`)

### Web Service
- [ ] Web service created
- [ ] Connected to correct GitHub repository
- [ ] Build command set: `npm install && cd server && npm install`
- [ ] Start command set: `cd server && npm start`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=<your_database_url>`
- [ ] Service deployed successfully
- [ ] Deployment logs show no errors

---

## Post-Deployment Testing

### Basic Functionality
- [ ] App URL loads: `https://your-app.onrender.com`
- [ ] Health check works: `https://your-app.onrender.com/api/health`
- [ ] Homepage displays correctly
- [ ] No console errors in browser
- [ ] Theme toggle works (dark/light mode)

### Core Features
- [ ] Can create a new daily sheet
- [ ] Can enter data in cells
- [ ] Dynamic row expansion works (type in last rows)
- [ ] Data saves to database (click Save button)
- [ ] Can reload page and data persists
- [ ] Can load previous dates
- [ ] Denominations section works
- [ ] Calculations update correctly

### Advanced Features
- [ ] Formula cells work (e.g., `=SUM(...)`)
- [ ] Keyboard shortcuts work (Enter, Tab, Ctrl+S)
- [ ] Export to CSV works
- [ ] Export to PDF works
- [ ] Generate report works
- [ ] Multiple sections expand independently

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No lag when typing in cells
- [ ] Row expansion is smooth
- [ ] Save operation completes quickly
- [ ] No memory leaks (check browser DevTools)

---

## Security & Best Practices

### Security
- [ ] `.env` file NOT in repository
- [ ] Database credentials secure (using Render's DATABASE_URL)
- [ ] HTTPS enabled (automatic on Render)
- [ ] No API keys hardcoded in client code
- [ ] CORS configured correctly

### Monitoring
- [ ] Render logs accessible
- [ ] No errors in deployment logs
- [ ] No errors in runtime logs
- [ ] Database connection successful
- [ ] Health check endpoint responding

### Backup & Recovery
- [ ] Database backup enabled (in Render settings)
- [ ] Know how to rollback deployment (Render dashboard)
- [ ] Have local backup of database schema
- [ ] GitHub repository is backed up

---

## Optional Enhancements

### Performance
- [ ] Consider upgrading to paid tier (no sleep)
- [ ] Set up CDN for static assets
- [ ] Enable database connection pooling
- [ ] Add caching for API responses

### Monitoring
- [ ] Set up UptimeRobot to prevent sleep (free tier)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up analytics (e.g., Google Analytics)
- [ ] Monitor database size

### Features
- [ ] Add custom domain
- [ ] Set up email notifications
- [ ] Add user authentication (if needed)
- [ ] Set up automated backups

---

## Troubleshooting

### If Deployment Fails
1. Check Render build logs
2. Verify all dependencies in `package.json`
3. Ensure `DATABASE_URL` is set correctly
4. Check Node.js version compatibility
5. Review error messages carefully

### If App Doesn't Load
1. Check Render service logs
2. Verify health check endpoint
3. Check database connection
4. Ensure tables are created
5. Verify environment variables

### If Data Doesn't Save
1. Check database connection in logs
2. Verify tables exist in database
3. Check API endpoints in browser Network tab
4. Review server logs for errors
5. Test database connection manually

---

## Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Can create and save daily sheets
- ✅ Dynamic row expansion works
- ✅ Data persists after page reload
- ✅ All features work as expected
- ✅ No errors in logs
- ✅ Performance is acceptable

---

## Next Steps After Deployment

1. **Share your app** with users
2. **Monitor performance** in Render dashboard
3. **Set up backups** for database
4. **Consider upgrading** to paid tier if needed
5. **Add custom domain** (optional)
6. **Set up monitoring** (UptimeRobot, etc.)
7. **Gather user feedback**
8. **Plan future enhancements**

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express.js Docs**: https://expressjs.com/

---

## Emergency Contacts

- **Render Status**: https://status.render.com
- **Render Support**: support@render.com
- **GitHub Support**: https://support.github.com

---

**Last Updated**: October 12, 2025  
**Deployment Platform**: Render  
**Estimated Deployment Time**: 15-20 minutes
