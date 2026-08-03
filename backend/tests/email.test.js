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
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    delete process.env.CLIENT_URL;

    const result = checkEmailConfig();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('RESEND_API_KEY');
    expect(result.missing).toContain('EMAIL_FROM');
    expect(result.missing).toContain('CLIENT_URL');
  });

  test('checkEmailConfig succeeds when all variables are present', () => {
    process.env.RESEND_API_KEY = 're_123456789';
    process.env.EMAIL_FROM = 'DevFlow <onboarding@resend.dev>';
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
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    await expect(sendEmail({ to: 'user@example.com', subject: 'Test', html: '<p>Hi</p>' })).rejects.toThrow(
      'RESEND_API_KEY and EMAIL_FROM environment variables are required'
    );
  });
});
