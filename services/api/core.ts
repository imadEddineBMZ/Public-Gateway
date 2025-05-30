import { createPostsClient } from '../../client/postsClient';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { 
  AnonymousAuthenticationProvider, 
  AuthenticationProvider,
  BaseBearerTokenAuthenticationProvider,
  RequestAdapter,
  AccessTokenProvider,
  AllowedHostsValidator
} from '@microsoft/kiota-abstractions';

// API base URL - consider moving to environment variables
export const API_BASE_URL = "https://localhost:57679";

// Create a request adapter factory that sets the base URL
export function createAdapter(authProvider: AuthenticationProvider): RequestAdapter {
  const adapter = new FetchRequestAdapter(authProvider);
  adapter.baseUrl = API_BASE_URL;
  return adapter;
}

// Create an anonymous client (for endpoints that don't require auth)
export const anonymousAuthProvider = new AnonymousAuthenticationProvider();
export const anonymousAdapter = createAdapter(anonymousAuthProvider);
export const anonymousClient = createPostsClient(anonymousAdapter);

// Create an authenticated client (with token)
export function createAuthenticatedClient(token: string) {
  // Remove 'Bearer ' prefix if it already exists
  const cleanedToken = token.startsWith('Bearer ') ? token.substring(7) : token;
  
  // Implement AccessTokenProvider interface correctly
  class TokenProvider implements AccessTokenProvider {
    async getAuthorizationToken(
      url?: string,
      additionalAuthenticationContext?: Record<string, unknown>
    ): Promise<string> {
      // Return the provided token with Bearer prefix (already cleaned)
      return `Bearer ${cleanedToken}`;
    }

    getAllowedHostsValidator(): AllowedHostsValidator {
      return {
        isUrlHostValid: (url: URL): boolean => {
          // Extract hostname from API_BASE_URL instead of hardcoding
          try {
            const apiUrl = new URL(API_BASE_URL);
            return url.hostname === apiUrl.hostname || 
                   url.hostname === 'localhost' || 
                   url.hostname === '127.0.0.1';
          } catch (error) {
            console.error("Error parsing API URL:", error);
            // Fallback to allow localhost
            return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
          }
        }
      };
    }
  }

  class CustomBearerTokenProvider extends BaseBearerTokenAuthenticationProvider {
    authenticateRequest = async (request: any): Promise<void> => {
      try {
        // Get token from provider
        const token = await this.accessTokenProvider.getAuthorizationToken();
        
        // Token should already be properly formatted with Bearer prefix
        request.headers.set('Authorization', token);
      } catch (error) {
        console.error("Error in authenticateRequest:", error);
        throw error;
      }
    };
  }

  const accessTokenProvider = new TokenProvider();
  const authProvider = new CustomBearerTokenProvider(accessTokenProvider);
  const adapter = createAdapter(authProvider);
  return createPostsClient(adapter);
}