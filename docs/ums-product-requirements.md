# User Management Service (UMS) - PRD

## 1. Service Overview

### Purpose
The User Management Service handles all aspects of user authentication, authorization, and profile management across the Carmen Supply Chain Platform. It provides centralized control over user access while ensuring proper tenant isolation and role-based permissions.

### Scope
- Multi-tenant user authentication
- Role-based access control (RBAC)
- Profile and session management
- Property and department assignments
- Business unit management
- Audit logging

## 2. Core Functionality

### Authentication
- JWT-based authentication system
- Tenant-aware authentication
  - Domain-based tenant resolution
  - Tenant-specific user validation
- Password encryption and validation
- Session management with token expiration
- Secure cookie handling

### Authorization
- Role-based access control (RBAC)
- Permission management
- Access level hierarchy:
  - System level (admin)
  - Tenant level
  - Property level
  - Department level
- Business unit access control

### User Management
- Multi-tenant user profiles
- Property and department assignments
- Role assignments
- Business unit configuration
- Status management (active/inactive)
- Last login tracking
- Avatar support

### Session Management
- JWT token-based sessions
- Session expiration handling
- Token refresh mechanism
- Secure cookie storage
- Cross-domain session handling

## 3. Technical Requirements

### API Endpoints
- /auth/login
  - POST: Authenticate user with email/password
  - Response: User profile and session token
- /auth/logout
  - POST: Invalidate current session
- /users/profile
  - GET: Retrieve current user profile
  - PATCH: Update user profile
- /users
  - GET: List users (admin only)
  - POST: Create new user
- /users/[id]
  - GET: Get user details
  - PUT: Update user
  - DELETE: Deactivate user

### Data Model
- User
  ```prisma
  model User {
    id            String    @id @default(cuid())
    tenantId      String
    email         String
    name          String
    password      String
    role          String    @default("user")
    propertyId    String?
    departmentId  String?
    businessUnit  String?
    avatar        String?
    status        String    @default("active")
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    lastLoginAt   DateTime?
    tenant        Tenant    @relation(fields: [tenantId], references: [id])
    property      Property? @relation(fields: [propertyId], references: [id])
    department    Department? @relation(fields: [departmentId], references: [id])
    sessions      Session[]
  }
  ```
- Session
  ```prisma
  model Session {
    id        String   @id @default(cuid())
    userId    String
    token     String   @unique
    expiresAt DateTime
    createdAt DateTime @default(now())
    user      User     @relation(fields: [userId], references: [id])
  }
  ```

### Dependencies
- Database Service (PostgreSQL)
- JWT Service
- Cache Service
- Notification Service

## 4. Security Requirements

### Authentication Security
- Password hashing using bcrypt
- JWT token encryption
- Secure cookie configuration
  - HttpOnly
  - Secure in production
  - SameSite policy
- Rate limiting on auth endpoints

### Access Control
- Tenant isolation
- Role-based permissions
- Property/Department scoping
- Session validation

### Audit Requirements
- Login attempts logging
- Session creation/invalidation
- Profile changes tracking
- Role modifications

## 5. Performance Requirements

### Response Times
- Authentication: < 500ms
- Profile operations: < 200ms
- Session validation: < 100ms

### Capacity
- Support 10,000 concurrent users
- Handle 1,000 auth requests/minute
- Maintain 100,000 active sessions

### Scalability
- Horizontal scaling support
- Session distribution
- Cache implementation
- Database connection pooling

## 6. Default Configuration

### Default Admin User
- Email: admin@carmen.io
- Role: admin
- Default password: admin123 (change in production)
- Associated with default tenant

### Default Tenant
- Name: Default Tenant
- Code: DEFAULT
- Type: hotel
- Status: active

## 7. Implementation Notes

### Login Flow
1. User submits email/password
2. System resolves tenant from email domain
3. Validates credentials against tenant's user base
4. Creates JWT session with user and tenant info
5. Sets secure HTTP-only cookie
6. Returns user profile and session info

### Session Management
1. JWT stored in HTTP-only cookie
2. 8-hour expiration by default
3. Automatic token refresh
4. Secure session invalidation

### Error Handling
- Invalid credentials
- Expired sessions
- Rate limiting
- Tenant resolution failures
- Permission violations

## 8. Documentation Requirements

### API Documentation
- Authentication endpoints
- User management endpoints
- Session management
- Error codes and handling

### User Documentation
- Login procedures
- Profile management
- Password policies
- Security best practices