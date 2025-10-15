/**
 * User Management API Tests
 *
 * Comprehensive tests for all user management endpoints:
 * - GET /api/users
 * - POST /api/users
 * - GET /api/users/:id
 * - PUT /api/users/:id
 * - DELETE /api/users/:id
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

describe('GET /api/users', () => {
  let authToken: string;

  beforeEach(async () => {
    const user = await createTestUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    authToken = generateAuthToken(user._id.toString(), user.email);
  });

  it('should return list of users with authentication', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('users');
    expect(response.body.data).toHaveProperty('total');
    expect(response.body.data).toHaveProperty('page');
    expect(response.body.data).toHaveProperty('limit');
    expect(response.body.data.users).toBeInstanceOf(Array);
  });

  it('should not include password in user data', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    response.body.data.users.forEach((user: Record<string, unknown>) => {
      expect(user).not.toHaveProperty('password');
    });
  });

  it('should support pagination', async () => {
    // Create multiple users
    for (let i = 1; i <= 15; i++) {
      await createTestUser({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: 'Password123!',
      });
    }

    const response = await request(app)
      .get('/api/users?page=2&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.page).toBe(2);
    expect(response.body.data.limit).toBe(10);
    expect(response.body.data.users.length).toBeLessThanOrEqual(10);
  });

  it('should support search by name', async () => {
    await createTestUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    });

    await createTestUser({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'Password123!',
    });

    const response = await request(app)
      .get('/api/users?search=john')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.users.length).toBeGreaterThan(0);
    expect(response.body.data.users[0].name).toContain('John');
  });

  it('should reject request without authentication', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/users', () => {
  let authToken: string;

  beforeEach(async () => {
    const user = await createTestUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123!',
    });

    authToken = generateAuthToken(user._id.toString(), user.email);
  });

  it('should create new user with auto-generated password', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'New User',
        email: 'newuser@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('generatedPassword');
    expect(response.body.data.user.name).toBe('New User');
    expect(response.body.data.user.email).toBe('newuser@example.com');
    expect(response.body.data.user.mustChangePassword).toBe(true);
    expect(response.body.data.generatedPassword).toBeTruthy();
    expect(response.body.data.generatedPassword.length).toBeGreaterThanOrEqual(12);
  });

  it('should reject creation with duplicate email', async () => {
    await createTestUser({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'Password123!',
    });

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Another User',
        email: 'existing@example.com',
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('already exists');
  });

  it('should reject creation with missing name', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'newuser@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('required');
  });

  it('should reject creation with missing email', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'New User',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('required');
  });

  it('should reject creation without authentication', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'New User',
        email: 'newuser@example.com',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should allow login with generated password', async () => {
    const createResponse = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'New User',
        email: 'newuser@example.com',
      });

    const generatedPassword = createResponse.body.data.generatedPassword;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'newuser@example.com',
        password: generatedPassword,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
  });
});

describe('GET /api/users/:id', () => {
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

  it('should return user by ID with authentication', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.name).toBe('Test User');
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    const response = await request(app)
      .get(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('not found');
  });

  it('should reject request without authentication', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('PUT /api/users/:id', () => {
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

  it('should update user name', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Name');
  });

  it('should update user email', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'newemail@example.com',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('newemail@example.com');
  });

  it('should update both name and email', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'New Name',
        email: 'newemail@example.com',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('New Name');
    expect(response.body.data.email).toBe('newemail@example.com');
  });

  it('should reject update with duplicate email', async () => {
    await createTestUser({
      name: 'Other User',
      email: 'other@example.com',
      password: 'Password123!',
    });

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'other@example.com',
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('already exists');
  });

  it('should reject update without any fields', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('At least one field');
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    const response = await request(app)
      .put(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('should reject request without authentication', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        name: 'Updated Name',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('DELETE /api/users/:id', () => {
  let authToken: string;
  let userId: string;
  let otherUserId: string;

  beforeEach(async () => {
    const user = await createTestUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123!',
    });

    userId = user._id.toString();
    authToken = generateAuthToken(userId, user.email);

    const otherUser = await createTestUser({
      name: 'Other User',
      email: 'other@example.com',
      password: 'Password123!',
    });

    otherUserId = otherUser._id.toString();
  });

  it('should delete user successfully', async () => {
    const response = await request(app)
      .delete(`/api/users/${otherUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('deleted successfully');

    // Verify user is deleted
    const getResponse = await request(app)
      .get(`/api/users/${otherUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getResponse.status).toBe(404);
  });

  it('should prevent user from deleting themselves', async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('cannot delete your own account');
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    const response = await request(app)
      .delete(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('should reject request without authentication', async () => {
    const response = await request(app)
      .delete(`/api/users/${otherUserId}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
