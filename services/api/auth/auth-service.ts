import { anonymousClient } from '../core';

/**
 * Login user with email and password
 */
export async function login(email: string, password: string): Promise<{ token: string }> {
  try {
    const response = await anonymousClient.auth.login.post({
      email,
      password
    });
    
    if (!response) {
      throw new Error('No token received from server');
    }
    
    return { token: response }; // Transform the string token into the expected object format
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function register(userData: any) {
  try {
    const response = await anonymousClient.auth.register.post(userData);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}