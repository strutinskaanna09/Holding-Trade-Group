# Bugs and Issues Report

## 🔴 CRITICAL SECURITY ISSUES

### 1. Insecure JWT Secret Default Value
**Location:** `apps/api/src/auth/jwt.strategy.ts:11` and `apps/api/src/auth/auth.module.ts:14`
**Issue:** JWT_SECRET defaults to `'secretKey'` if environment variable is not set. This is a major security vulnerability.
**Impact:** In production, if JWT_SECRET is not set, tokens can be easily forged.
**Fix:** Remove default value and throw error if JWT_SECRET is not set in production.

### 2. No Authentication Guard on Upload Endpoint
**Location:** `apps/api/src/uploads/uploads.controller.ts:9`
**Issue:** File upload endpoint has no authentication guard, allowing anyone to upload files.
**Impact:** Unauthorized file uploads, potential storage exhaustion, security risks.
**Fix:** Add `@UseGuards(JwtAuthGuard)` to the upload endpoint.

### 3. No File Type Validation
**Location:** `apps/api/src/uploads/uploads.controller.ts:10-27`
**Issue:** No validation of file MIME types or extensions. Malicious files could be uploaded.
**Impact:** Potential security vulnerabilities (malware uploads, script execution).
**Fix:** Add file type validation (e.g., only images: jpg, png, webp).

## 🟠 HIGH PRIORITY BUGS

### 4. Product Creation Fails When categoryId is Missing
**Location:** `apps/api/src/products/products.service.ts:131`
**Issue:** The `create` method always tries to connect a category, even if `categoryId` is `null` or `undefined`.
**Impact:** Product creation will fail with a Prisma error if categoryId is not provided.
**Fix:** Add validation to ensure categoryId exists before attempting to connect, or make it optional.

```typescript
// Current code (BUGGY):
const createData: Prisma.ProductCreateInput = {
    ...rest,
    category: {
        connect: { id: categoryId }  // Will fail if categoryId is null/undefined
    }
};

// Should be:
if (!categoryId) {
    throw new BadRequestException('categoryId is required');
}
// or handle as optional
```

### 5. No Input Validation for Query Parameters
**Location:** `apps/api/src/products/products.controller.ts:20-21`
**Issue:** Page and limit parameters are converted to numbers without validation. Negative numbers, NaN, or zero could cause issues.
**Impact:** 
- Negative page/limit could cause incorrect queries
- Division by zero in pagination calculations
- NaN values could crash the application
**Fix:** Validate and sanitize query parameters:
```typescript
page: page ? Math.max(1, +page) : 1,
limit: limit ? Math.min(Math.max(1, +limit), 100) : 20,  // Cap at 100
```

### 6. Missing Error Handling for Non-existent Resources
**Location:** 
- `apps/api/src/products/products.service.ts:159` (update)
- `apps/api/src/products/products.service.ts:166` (remove)
- `apps/api/src/leads/leads.service.ts:22` (remove)
**Issue:** Update and delete operations don't check if the resource exists before attempting to modify it.
**Impact:** Unclear error messages, potential for confusing 500 errors instead of 404.
**Fix:** Check existence first or handle Prisma NotFoundError and return appropriate HTTP status.

### 7. Product Slug Generation Could Create Duplicates
**Location:** `apps/api/src/products/products.service.ts:122`
**Issue:** Slug generation uses `Date.now()` but if two products are created in the same millisecond with the same name, they'll have duplicate slugs (violating unique constraint).
**Impact:** Product creation could fail with unique constraint violation.
**Fix:** Add uniqueness check or use a more robust slug generation (e.g., UUID suffix, retry logic).

### 8. No Input Validation in Auth Controller
**Location:** `apps/api/src/auth/auth.controller.ts:10`
**Issue:** Email and password are accessed directly from body without validation. If `body.email` or `body.password` is `null` or `undefined`, it could cause issues.
**Impact:** Poor error messages, potential crashes.
**Fix:** Add validation:
```typescript
if (!body.email || !body.password) {
    throw new BadRequestException('Email and password are required');
}
```

## 🟡 MEDIUM PRIORITY ISSUES

### 9. Extensive Use of `any` Types
**Location:** Throughout the codebase (found 41 instances)
**Issues:**
- `apps/api/src/products/products.controller.ts:37,43` - DTOs are `any`
- `apps/api/src/auth/auth.controller.ts:9` - Body is `any`
- `apps/api/src/auth/auth.service.ts:13,22` - Return types are `any`
- `apps/api/src/categories/categories.controller.ts:16` - Data is `any`

**Impact:** Loss of type safety, potential runtime errors, poor IDE support, harder to maintain.
**Fix:** Create proper DTOs with class-validator decorators and use them in controllers.

### 10. No Validation Pipes Enabled Globally
**Location:** `apps/api/src/main.ts`
**Issue:** No global validation pipe is configured, so no automatic validation occurs.
**Impact:** Invalid data can reach services, causing runtime errors.
**Fix:** Add to main.ts:
```typescript
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
}));
```

### 11. No Error Handling in Leads Service Delete
**Location:** `apps/api/src/leads/leads.service.ts:21-24`
**Issue:** No error handling if lead doesn't exist.
**Impact:** Unclear error messages.
**Fix:** Add try-catch or check existence first.

### 12. No Null Check for Product Slug in findOne
**Location:** `apps/api/src/products/products.service.ts:106`
**Issue:** If slug is null/undefined, Prisma will throw an error.
**Impact:** Unhandled exception instead of proper error response.
**Fix:** Add validation in controller or service.

### 13. Potential File Overwrite in Upload
**Location:** `apps/api/src/uploads/uploads.controller.ts:23`
**Issue:** Random filename generation could theoretically create duplicates (very unlikely but possible).
**Impact:** File overwrites if collision occurs.
**Fix:** Check for existing file or use UUID for better uniqueness guarantee.

### 14. Missing Error Handling in Auth Service
**Location:** `apps/api/src/auth/auth.service.ts:14`
**Issue:** If Prisma query fails (e.g., database connection error), it's not handled.
**Impact:** Unhandled exceptions instead of proper error responses.
**Fix:** Add try-catch blocks around database operations.

### 15. CORS Configuration Hardcoded
**Location:** `apps/api/src/main.ts:6-9`
**Issue:** CORS origins are hardcoded instead of using environment variables.
**Impact:** Need to rebuild/redeploy to change allowed origins.
**Fix:** Use environment variable for CORS origins.

## 🟢 LOW PRIORITY / CODE QUALITY ISSUES

### 16. Console.error Instead of Proper Logging
**Location:** `apps/api/src/products/products.service.ts:140`
**Issue:** Using console.error instead of a proper logging service.
**Impact:** Harder to manage logs in production, no log levels, no structured logging.
**Fix:** Use NestJS Logger service.

### 17. No Pagination Limit Validation
**Location:** `apps/api/src/products/products.controller.ts:21`
**Issue:** No maximum limit enforced. Users could request millions of records.
**Impact:** Performance issues, potential DoS.
**Fix:** Cap maximum limit (e.g., max 100).

### 18. Recursive Category Query Performance
**Location:** `apps/api/src/products/products.service.ts:90-104`
**Issue:** Recursive function makes multiple database queries (N+1 problem for deep hierarchies).
**Impact:** Performance degradation with deep category hierarchies.
**Fix:** Consider using a single recursive CTE query or caching.

### 19. Missing API_URL Environment Variable Documentation
**Location:** `apps/api/src/uploads/uploads.controller.ts:30`
**Issue:** API_URL defaults to localhost but might not be set correctly in production.
**Impact:** Incorrect URLs in production.
**Fix:** Document required environment variables, add validation.

### 20. No Input Sanitization
**Issue:** User inputs (search terms, names, descriptions) are not sanitized before being used in queries.
**Impact:** Potential for XSS if data is displayed, or SQL injection risk (though Prisma should protect against SQL injection).
**Fix:** Add input sanitization/validation, especially for user-facing fields.

## Summary

**Critical Issues:** 3
**High Priority Bugs:** 5
**Medium Priority Issues:** 12
**Low Priority Issues:** 4

**Total Issues Found:** 24

## Recommended Action Plan

1. **Immediate (Security):**
   - Fix JWT_SECRET default value
   - Add authentication to upload endpoint
   - Add file type validation

2. **Short-term (High Priority Bugs):**
   - Fix product creation categoryId validation
   - Add query parameter validation
   - Add error handling for non-existent resources
   - Add input validation to auth controller

3. **Medium-term (Code Quality):**
   - Create DTOs to replace `any` types
   - Add global validation pipes
   - Implement proper error handling throughout
   - Add proper logging

4. **Long-term (Optimization):**
   - Optimize recursive category queries
   - Add input sanitization
   - Improve error messages and responses
   - Add comprehensive testing



