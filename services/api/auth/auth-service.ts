import { anonymousClient } from '../core';
import { ApplicationUserDTO } from '@/client/models';
import { useAuth } from '../../../components/auth-provider';

/**
 * Login user with email and password
 */
export async function login(email: string, password: string): Promise<{ token: string; userData: any; userId: string }> {
  try {
    console.log("[AUTH SERVICE] Attempting login with:", email);
    
    // Use a lower-level fetch approach instead of relying on the client's handling
    const response = await fetch(`https://localhost:57679/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }
    
    // Parse the actual JSON response
    const data = await response.json();
    console.log("[AUTH SERVICE] Raw login response:", data);
    
    // Store the token and user info
    const userData = {
      id: data.userId,
      name: data.userDTO?.name || email.split('@')[0],
      email: email,
      token: data.jwToken,
    };
    
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Save token and continue without fetchCompleteUserData for now
    // We'll implement the complete profile fetch in the auth provider later
    localStorage.setItem("token", data.jwToken);
    
    // Return the properly structured response
    return { 
      token: data.jwToken,
      userData: data.userDTO || null,
      userId: data.userId || extractUserIdFromToken(data.jwToken)
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Login error:', error);
    throw error;
  }
}

/**
 * Extract user ID from JWT token (kept as a fallback)
 */
function extractUserIdFromToken(token: string): string {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    return payload.UserId || payload.nameid || payload.sub || 'unknown-user';
  } catch (error) {
    console.error('[AUTH SERVICE] Error extracting user ID from token:', error);
    return 'unknown-user';
  }
}

/**
 * Register a new user
 */
export async function register(userData: any): Promise<any> {
  try {
    console.log("[AUTH-SERVICE] Registering user with data:", userData);
    
    // Create a client instance
    const client = anonymousClient;
    
    // Add confirmPassword if it's missing but password exists
    if (userData.password && !userData.confirmPassword) {
      userData.confirmPassword = userData.password;
    }
    
    // Format request according to API expectations
    const registerRequest = {
      registerUserRequest: userData
    };
    
    // Call the API with the properly structured request
    const response = await client.auth.register.post(userData);
    
    console.log("[AUTH-SERVICE] Registration successful:", response);
    return response;
  } catch (error: any) {
    console.error("[AUTH-SERVICE] Registration error details:", error);
    
    // Extract and log specific validation errors
    if (error.responseStatusCode === 400 && error.errors) {
      console.error("[AUTH-SERVICE] Validation errors:", JSON.stringify(error.errors, null, 2));
    }
    
    throw error;
  }
}