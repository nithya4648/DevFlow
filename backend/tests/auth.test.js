const request = require('supertest');
const { app } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User.model');

let authCookie; // to store session cookie after login

describe('Authentication Flow', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Password123!'
  };

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Successful registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);
    expect(res.body.success).toBe(true);
  });

  test('Duplicate email registration fails', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  test('Login before verification fails with 403', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(403);
  });

  test('Verify email and login succeeds', async () => {
    const user = await User.findOne({ email: testUser.email });
    const token = user.verificationToken;
    await request(app).get(`/api/auth/verify-email/${token}`).expect(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    expect(loginRes.body.success).toBe(true);
    // Extract cookie for protected route tests
    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = cookies.find(c => c.startsWith('devflow_token'));
    expect(authCookie).toBeDefined();
  });

  test('Login with wrong password fails with 401', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' })
      .expect(401);
  });

  test('Protected route without token returns 401', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });

  test('Protected route with valid token returns 200', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('Forgot-password generates a reset token', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email })
      .expect(200);
    expect(res.body.success).toBe(true);
    const user = await User.findOne({ email: testUser.email });
    expect(user.resetPasswordToken).toBeDefined();
    // Store token for later invalid test
    this.resetToken = user.resetPasswordToken;
  });

  test('Reset-password with invalid/expired token fails', async () => {
    await request(app)
      .post('/api/auth/reset-password/invalidtoken')
      .send({ password: 'NewPassword123!' })
      .expect(400);
  });
});
