import { describe, expect, it } from 'vitest';
import { validateLoginForm, validateRegisterForm } from '@/lib/validation/auth';

describe('validateLoginForm', () => {
  it('accepts valid credentials and trims the email', () => {
    const result = validateLoginForm({ email: ' learner@example.com ', password: 'secret' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('learner@example.com');
    }
  });

  it('rejects an invalid email', () => {
    const result = validateLoginForm({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
  });
});

describe('validateRegisterForm', () => {
  it('accepts valid values and trims the optional name', () => {
    const result = validateRegisterForm({
      name: '  Alice  ',
      email: 'alice@example.com ',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Alice');
      expect(result.data.email).toBe('alice@example.com');
    }
  });

  it('allows omitting the name', () => {
    const result = validateRegisterForm({
      name: '   ',
      email: 'bob@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBeUndefined();
    }
  });

  it('rejects mismatched passwords', () => {
    const result = validateRegisterForm({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
    }
  });

  it('rejects short passwords', () => {
    const result = validateRegisterForm({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordErrors = result.error.flatten().fieldErrors.password;
      expect(passwordErrors?.[0]).toContain('8');
    }
  });
});
