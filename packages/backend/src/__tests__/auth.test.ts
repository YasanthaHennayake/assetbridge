/**
 * Authentication API Tests
 *
 * Comprehensive tests for all authentication endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/logout
 * - GET /api/auth/me
 * - POST /api/auth/change-password
 */

import request from 'supertest';
import app from '../app';
import { connectDatabase, closeDatabase, clearDatabase, createTestUser, generateAuthToken } from './setup';

// Setup and teardown
beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('POST /api/auth/login', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
  };

  beforeEach(async () => {
    await createTestUser(testUser);
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.user.name).toBe(testUser.name);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('should reject login with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: testUser.password,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid email or password');
  });

  it('should reject login with invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid email or password');
  });

  it('should reject login with missing email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: testUser.password,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Email and password are required');
  });

  it('should reject login with missing password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Email and password are required');
  });

  it('should update lastLogin timestamp on successful login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toHaveProperty('lastLogin');
    expect(response.body.data.user.lastLogin).not.toBeNull();
  });
});

describe('POST /api/auth/logout', () => {
  let authToken: string;

  beforeEach(async () => {
    const user = await createTestUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    authToken = generateAuthToken(user._id.toString(), user.email);
  });

  it('should logout successfully with valid token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Logout successful');
  });

  it('should reject logout without token', async () => {
    const response = await request(app)
      .post('/api/auth/logout');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject logout with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    userId = user._id.toString();
    authToken = generateAuthToken(userId, user.email);
  });

  it('should return current user with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.name).toBe('Test User');
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('should reject request without token', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject request with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/auth/change-password', () => {
  let authToken: string;
  const oldPassword = 'OldPassword123!';
  const newPassword = 'NewPassword456!';

  beforeEach(async () => {
    const user = await createTestUser({
      name: 'Test User',
      email: 'test@example.com',
      password: oldPassword,
      mustChangePassword: true,
    });

    authToken = generateAuthToken(user._id.toString(), user.email);
  });

  it('should change password successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Password changed successfully');
  });

  it('should clear mustChangePassword flag after successful password change', async () => {
    await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });

    // Verify by logging in and checking user data
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: newPassword,
      });

    expect(loginResponse.body.data.user.mustChangePassword).toBe(false);
  });

  it('should reject password change with incorrect current password', async () => {
    const response = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'WrongPassword123!',
        newPassword: newPassword,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Current password is incorrect');
  });

  it('should reject password change if new password is same as current', async () => {
    const response = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: oldPassword,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('New password must be different');
  });

  it('should reject password change with weak new password', async () => {
    const response = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: 'weak',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should reject password change without authentication', async () => {
    const response = await request(app)
      .post('/api/auth/change-password')
      .send({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject password change with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: oldPassword,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('required');
  });

  it('should allow login with new password after change', async () => {
    // Change password
    await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });

    // Try to login with new password
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: newPassword,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
  });

  it('should reject login with old password after change', async () => {
    // Change password
    await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: oldPassword,
        newPassword: newPassword,
      });

    // Try to login with old password
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: oldPassword,
      });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.success).toBe(false);
  });
});
