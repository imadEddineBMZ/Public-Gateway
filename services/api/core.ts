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
export const API_BASE_URL = "https://99c2-154-252-0-7.ngrok-free.app";

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
  // Implement AccessTokenProvider interface correctly
  class TokenProvider implements AccessTokenProvider {
    async getAuthorizationToken(
      url?: string,
      additionalAuthenticationContext?: Record<string, unknown>
    ): Promise<string> {
      // Return the provided token with Bearer prefix
      return `Bearer ${token}`;
    }

    getAllowedHostsValidator(): AllowedHostsValidator {
      return {
        isUrlHostValid: (url: URL): boolean => {
          // Allow your specific API domain - consider making this more dynamic
          return url.hostname === '99c2-154-252-0-7.ngrok-free.app';
        }
      };
    }
  }

  const accessTokenProvider = new TokenProvider();
  const authProvider = new BaseBearerTokenAuthenticationProvider(accessTokenProvider);
  const adapter = createAdapter(authProvider);
  return createPostsClient(adapter);
}