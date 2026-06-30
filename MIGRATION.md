# Migration Guide: Prisma/PostgreSQL to MongoDB

This document outlines the changes made during the migration from Prisma + Neon PostgreSQL to MongoDB.

## Summary of Changes

### Database Layer

- **Removed**: `@prisma/client`, `@prisma/adapter-pg`, `pg` dependencies
- **Added**: `mongoose` dependency
- **Removed**: `prisma/` directory with schema and migrations
- **Added**: `models/user.ts` and `models/project.ts` with Mongoose schemas

### Configuration

- **Removed**: `server/configs/prisma.ts` (Prisma client setup)
- **Updated**: `server/configs/prisma.ts` (now handles MongoDB connection)
- **Removed**: `prisma.config.ts`
- **Added**: MongoDB URI environment variable

### Controllers

All controllers have been rewritten to use Mongoose queries instead of Prisma:

#### Changes in each controller:

- `clerk.ts`: Prisma `.create()`, `.update()`, `.delete()` → Mongoose `.save()`, `.findOneAndUpdate()`, `.deleteOne()`
- `userController.ts`: Prisma `.findUnique()`, `.findMany()` → Mongoose `.findOne()`, `.find()`
- `projectController.ts`: Prisma operations → Mongoose operations with proper async handling

### Data Types

- UUIDs from Prisma → MongoDB ObjectId (automatically managed by Mongoose)
- Project IDs change from UUID string to ObjectId, serialized as string in API responses

### API Changes

- No breaking changes to API structure
- Response payloads remain the same (ObjectId stringified as `_id` or serialized)

### Environment Variables

**Old**:

```
DATABASE_URL=postgresql://...
```

**New**:

```
MONGODB_URI=mongodb+srv://...
```

## Migration Data (Manual Step if needed)

If you have existing data in PostgreSQL:

1. Export data from Neon PostgreSQL
2. Transform to match Mongoose schema format
3. Import to MongoDB using `mongoimport` or a custom script

## File Structure Changes

**Before**:

```
server/
  configs/
    prisma.ts          # Prisma client
  prisma/
    schema.prisma      # Database schema
    migrations/        # SQL migrations
```

**After**:

```
server/
  configs/
    prisma.ts          # MongoDB connection
  models/
    user.ts            # Mongoose User schema
    project.ts         # Mongoose Project schema
```

## Breaking Changes

None for the API layer. The following is transparent to API consumers:

- Database identifier type: UUID → MongoDB ObjectId
- Project IDs returned as `_id` string field in JSON
- Timestamp handling: Prisma `@updatedAt` → Mongoose `updatedAt` (same behavior)

## Testing the Migration

After deploying the changes:

1. **Verify MongoDB Connection**:

   ```bash
   curl http://localhost:5000/  # Should return "Server is Live!"
   ```

2. **Test User Sync** (via Clerk webhook):
   - Sign up a new user
   - User document should appear in MongoDB
   - Check: `db.users.find()`

3. **Test Project Creation**:
   - Upload images and create a project
   - Project should be saved in MongoDB
   - Check: `db.projects.find()`

4. **Test Credits**:
   - Verify credit deduction works
   - Check user credits: `GET /api/user/credits`

## Rollback Plan

If you need to rollback to Postgres:

1. Restore from backup
2. Revert dependencies in `package.json`
3. Restore `prisma/` directory
4. Update `.env` with `DATABASE_URL`
5. Restart services

## Performance Considerations

### MongoDB vs PostgreSQL

- **Pros**: Schema flexibility, horizontal scaling, document-based queries
- **Cons**: Different query patterns, no ACID transactions by default
- **For this project**: MongoDB is suitable due to simple schema and non-relational queries

### Optimizations Applied

- Indexed queries on `userId` and `_id`
- Proper async/await handling
- Batch operations for credit updates

## Future Enhancements

1. Add indexes in Mongoose for frequently queried fields
2. Implement database connection pooling
3. Add data validation middleware
4. Consider transaction support for credit operations

## Support

For issues during or after migration:

- Verify MongoDB connection string
- Check network access (MongoDB Atlas IP whitelist)
- Review Mongoose error messages for query issues
