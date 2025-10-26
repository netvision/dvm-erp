# Production Migration Guide

## Current Critical Issue: Missing employee_id Column

**Problem**: The production database is missing the `employee_id` column in the `users` table, causing 500 errors when users try to update their profiles.

**Solution**: Run the migration script: `database/add_employee_id_column.sql`

### Quick Fix - Run This SQL on Production:

```sql
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'employee_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN employee_id VARCHAR(50) UNIQUE;
        
        CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
        
        RAISE NOTICE 'Column employee_id added successfully';
    ELSE
        RAISE NOTICE 'Column employee_id already exists';
    END IF;
END $$;
```

---

## Previous Migration: external_url Column

This guide also explains how to add the `external_url` column to the `media_resources` table (if not already done).

## 🚀 Method 1: SSH + Node.js (Recommended)

If you have SSH access to your server:

```bash
# 1. SSH to your server
ssh username@your-server.com

# 2. Navigate to your project directory
cd /path/to/your/dvm-erp

# 3. Pull latest changes (if not already done)
git pull origin main

# 4. Install dependencies (if needed)
npm install

# 5. Run the production migration
NODE_ENV=production node database/migrate_production.js
```

## 🗄️ Method 2: Direct SQL (psql command line)

If you have psql access:

```bash
# Option A: Run from local machine (if you have remote DB access)
psql -h your-db-host -U your-username -d your-database -f database/migrate_external_url.sql

# Option B: Upload SQL file to server and run
scp database/migrate_external_url.sql username@server:/tmp/
ssh username@server
psql -d your_database -f /tmp/migrate_external_url.sql
```

## 🎛️ Method 3: Database GUI Tools

If you use pgAdmin, DBeaver, or similar tools:

1. Connect to your production database
2. Open the SQL editor
3. Copy and paste the contents of `database/migrate_external_url.sql`
4. Execute the SQL

## 🌐 Method 4: Cloud Database Services

### For managed databases (AWS RDS, Google Cloud SQL, etc.):

1. **AWS RDS:**
   ```bash
   psql -h your-rds-endpoint.amazonaws.com -U username -d database_name -f database/migrate_external_url.sql
   ```

2. **Heroku Postgres:**
   ```bash
   heroku pg:psql DATABASE_URL --app your-app-name < database/migrate_external_url.sql
   ```

3. **Railway/Render:**
   - Use their web console or connection string with psql

## 🔍 Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'media_resources' AND column_name = 'external_url';

-- Should return: external_url | text | YES
```

## ⚠️ Important Notes

1. **Backup First:** Always backup your production database before running migrations
2. **Test Connection:** Ensure you can connect to the production database
3. **Environment Variables:** Make sure your `.env.production` file has correct database credentials
4. **Safe Migration:** The migration uses `IF NOT EXISTS` so it's safe to run multiple times
5. **No Downtime:** This is an additive change that won't affect existing functionality

## 🆘 Troubleshooting

### Connection Issues:
- Check database host, port, username, password
- Verify firewall settings and security groups
- Ensure database server is running

### Permission Issues:
- User must have ALTER TABLE permissions on media_resources
- For cloud databases, ensure your user has proper privileges

### SSL Issues:
- Some cloud databases require SSL connections
- Add `?sslmode=require` to connection string if needed

## 📝 After Migration

Once the migration is complete:

1. **Deploy Backend Code:** Push the updated backend code with the new queries
2. **Deploy Frontend Code:** Push the updated frontend with media viewer functionality  
3. **Test Media Upload:** Try uploading a media file to verify everything works
4. **Monitor Logs:** Check application logs for any issues

## 🔄 Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove the column (CAUTION: This will delete data!)
ALTER TABLE media_resources DROP COLUMN IF EXISTS external_url;
```

**Note:** Only rollback if absolutely necessary, as this will delete any stored external URLs.