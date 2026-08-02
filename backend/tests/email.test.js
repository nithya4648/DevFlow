const { checkEmailConfig, sendVerificationEmail, sendEmail } = require('../utils/email.utils');

describe('Email Configuration and Utility Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('checkEmailConfig detects missing environment variables', () => {
    delete process.env.EMAIL_USER;
    delete process.env.GMAIL_USER;
    delete process.env.EMAIL_APP_PASSWORD;
    delete process.env.EMAIL_PASS;
    delete process.env.CLIENT_URL;

    const result = checkEmailConfig();
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  test('checkEmailConfig succeeds when all variables are present', () => {
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_APP_PASSWORD = 'password';
    process.env.CLIENT_URL = 'http://localhost:3000';

    const result = checkEmailConfig();
    expect(result.valid).toBe(true);
    expect(result.missing.length).toBe(0);
  });

  test('sendVerificationEmail throws MISSING_CONFIG error if CLIENT_URL is missing', async () => {
    delete process.env.CLIENT_URL;

    await expect(sendVerificationEmail('user@example.com', 'token123')).rejects.toThrow(
      'CLIENT_URL environment variable is required'
    );
  });

  test('sendEmail throws MISSING_CONFIG when credentials are missing in non-test mode', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.EMAIL_USER;
    delete process.env.GMAIL_USER;
    delete process.env.EMAIL_APP_PASSWORD;
    delete process.env.EMAIL_PASS;

    await expect(sendEmail({ to: 'user@example.com', subject: 'Test', html: '<p>Hi</p>' })).rejects.toThrow(
      'Missing SMTP credentials'
    );
  });
});
