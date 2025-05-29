import { createPostsClient } from '../client/postsClient';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { 
  AnonymousAuthenticationProvider, 
  AuthenticationProvider,
  BaseBearerTokenAuthenticationProvider,
  RequestAdapter,
  RequestInformation,
  AccessTokenProvider,
  AllowedHostsValidator
} from '@microsoft/kiota-abstractions';
import { 
  BloodTansfusionCenterDTO, 
  ListBloodTansfusionCentersResponse
} from '../client/models';

// API base URL
const API_BASE_URL = "https://99c2-154-252-0-7.ngrok-free.app";

// Create a request adapter factory that sets the base URL
function createAdapter(authProvider: AuthenticationProvider): RequestAdapter {
  const adapter = new FetchRequestAdapter(authProvider);
  adapter.baseUrl = API_BASE_URL;
  return adapter;
}

// Create an anonymous client (for endpoints that don't require auth)
const anonymousAuthProvider = new AnonymousAuthenticationProvider();
const anonymousAdapter = createAdapter(anonymousAuthProvider);
const anonymousClient = createPostsClient(anonymousAdapter);

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
          // Allow your specific API domain
          return url.hostname === 'b56b-154-252-0-7.ngrok-free.app';
        }
      };
    }
  }

  const accessTokenProvider = new TokenProvider();
  const authProvider = new BaseBearerTokenAuthenticationProvider(accessTokenProvider);
  const adapter = createAdapter(authProvider);
  return createPostsClient(adapter);
}

// API methods
export async function getBloodTansfusionCenters(): Promise<BloodTansfusionCenterDTO[]> {
  try {
    const response = await anonymousClient.bTC.get() as ListBloodTansfusionCentersResponse;
    return response.bloodTansfusionCenters || [];
  } catch (error) {
    console.error('Error fetching blood transfusion centers:', error);
    return [];
  }
}

export async function subscribeToBloodTansfusionCenter(token: string, bloodTansfusionCenterId: string) {
  try {
    const client = createAuthenticatedClient(token);
    const response = await client.subscriptions.post({
      bloodTansfusionCenterId: bloodTansfusionCenterId
    });
    return response;
  } catch (error) {
    console.error('Error subscribing to blood transfusion center:', error);
    throw error;
  }
}

export async function unsubscribeFromBloodTansfusionCenter(token: string, subscriptionId: string) {
  try {
    const client = createAuthenticatedClient(token);
    await client.subscriptions.bySubscriptionId(subscriptionId).delete();
    return true;
  } catch (error) {
    console.error('Error unsubscribing from blood transfusion center:', error);
    throw error;
  }
}

export async function getSubscribedBloodTansfusionCenters(token: string) {
  try {
    const client = createAuthenticatedClient(token);
    const response = await client.bTC.subscribed.get();
    return response?.btCsubscribed || [];
  } catch (error) {
    console.error('Error fetching subscribed blood transfusion centers:', error);
    return [];
  }
}

// Add additional API methods here as needed
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

export async function register(userData: any) {
  try {
    const response = await anonymousClient.auth.register.post(userData);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function getWilayas() {
  try {
    const response = await anonymousClient.wilayas.get();
    return response?.wilayas || [];
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    return [];
  }
}

export async function getCommunes(wilayaId: number) {
  try {
    const response = await anonymousClient.communes.byWilayaId(wilayaId).get();
    return response?.communes || [];
  } catch (error) {
    console.error(`Error fetching communes for wilaya ${wilayaId}:`, error);
    return [];
  }
}

// Add this function for direct fetch as a fallback
export async function getBloodTansfusionCentersDirect(): Promise<any[]> {
  try {
    console.log('Attempting direct fetch to:', `${API_BASE_URL}/api/BTC`);
    const response = await fetch(`${API_BASE_URL}/api/BTC`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Direct fetch response:', data);
    return data.bloodTansfusionCenters || [];
  } catch (error) {
    console.error('Error in direct fetch:', error);
    return [];
  }
}

// Update the API service functions to accept fetchLevel parameter

/**
 * Get public blood donation requests
 * @param level Level of data to fetch (0-3, where higher means more data)
 */
export async function getPublicBloodDonationRequests(level: number = 1): Promise<any[]> {
  try {
    console.log(`Fetching public blood donation requests with level: ${level}`);
    const response = await anonymousClient.bloodDonationRequests.get({
      queryParameters: {
        level: level
      }
    });
    return response?.bloodDonationRequests || [];
  } catch (error) {
    console.error('Error fetching public blood donation requests:', error);
    // Try direct fetch as fallback
    return getPublicBloodDonationRequestsDirect(level);
  }
}

/**
 * Direct fetch fallback for public blood donation requests
 * @param level Level of data to fetch
 */
export async function getPublicBloodDonationRequestsDirect(level: number = 1): Promise<any[]> {
  try {
    console.log(`Attempting direct fetch for blood donation requests with level: ${level}`);
    const response = await fetch(`${API_BASE_URL}/api/BloodDonationRequests?level=${level}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.bloodDonationRequests || [];
  } catch (error) {
    console.error('Error in direct fetch for blood donation requests:', error);
    return [];
  }
}

/**
 * Get authenticated blood donation requests
 * @param token Authentication token
 * @param fetchLevel Level of data to fetch
 */
export async function getAuthenticatedBloodDonationRequests(token: string, fetchLevel: number = 1): Promise<any[]> {
  try {
    console.log(`Fetching authenticated blood donation requests with level: ${fetchLevel}`);
    const client = createAuthenticatedClient(token);
    const response = await client.bloodDonationRequests.get({
      queryParameters: {
        level: fetchLevel
      }
    });
    return response?.bloodDonationRequests || [];
  } catch (error) {
    console.error('Error fetching authenticated blood donation requests:', error);
    return [];
  }
}

/**
 * Get blood donation requests from hospitals the user is subscribed to
 */
export async function getSubscribedHospitalRequests(token: string): Promise<any[]> {
  try {
    console.log('Fetching blood donation requests from subscribed hospitals');
    const client = createAuthenticatedClient(token);
    const response = await client.bloodDonationRequests.subscribed.get();
    return response?.bloodDonationRequests || [];
  } catch (error) {
    console.error('Error fetching requests from subscribed hospitals:', error);
    return [];
  }
}

/**
 * Get blood donation requests that match the user's blood type
 */
export async function getMatchingBloodTypeRequests(token: string): Promise<any[]> {
  try {
    console.log('Fetching blood donation requests matching user blood type');
    const client = createAuthenticatedClient(token);
    const response = await client.bloodDonationRequests.matching.get();
    return response?.bloodDonationRequests || [];
  } catch (error) {
    console.error('Error fetching blood type matching requests:', error);
    return [];
  }
}

/**
 * Get requests from a specific blood transfusion center
 * Can be used with or without authentication
 */
export async function getRequestsByBloodTransfusionCenter(btcId: string, token?: string): Promise<any[]> {
  try {
    console.log(`Fetching blood donation requests for center ID: ${btcId}`);
    
    // Use authenticated client if token is provided, otherwise use anonymous client
    const client = token ? createAuthenticatedClient(token) : anonymousClient;
    
    // Cast to any to resolve the "Object is of type 'unknown'" error
    const response = await (client.bTC.byBtcId(btcId) as any).bloodDonationRequests.get();
    return response?.bloodDonationRequests || [];
  } catch (error) {
    console.error(`Error fetching requests for blood transfusion center ${btcId}:`, error);
    return [];
  }
}

/**
 * Get nearby blood donation requests based on user's location
 * This requires authentication for personalized results
 */
export async function getNearbyRequests(token: string, radius: number = 10): Promise<any[]> {
  try {
    console.log(`Fetching nearby blood donation requests within ${radius}km`);
    const client = createAuthenticatedClient(token);
    const response = await client.bloodDonationRequests.nearby.get({
      queryParameters: {
        radius: radius
      }
    });
    return response?.bloodDonationRequests || [];
  } catch (error) {
    console.error('Error fetching nearby blood donation requests:', error);
    return [];
  }
}

/**
 * Create a new blood donation request (usually called by medical staff)
 */
export async function createBloodDonationRequest(token: string, requestData: any): Promise<any> {
  try {
    console.log('Creating new blood donation request');
    const client = createAuthenticatedClient(token);
    const response = await client.bloodDonationRequests.post(requestData);
    return response;
  } catch (error) {
    console.error('Error creating blood donation request:', error);
    throw error;
  }
}

/**
 * Pledge to donate for a specific blood donation request
 */
export async function pledgeToDonate(token: string, requestId: string): Promise<any> {
  try {
    console.log(`Pledging to donate for request ID: ${requestId}`);
    const client = createAuthenticatedClient(token);
    const response = await client.pledges.post({
      bloodDonationRequestId: requestId
    });
    return response;
  } catch (error) {
    console.error(`Error pledging to donate for request ${requestId}:`, error);
    throw error;
  }
}

/**
 * Get all non-anonymous donors (regardless of privacy settings)
 * This requires authentication (admin or medical staff)
 * @param token Authentication token
 * @param fetchLevel Level of data to fetch
 */
export async function getAllNonAnonymousDonors(token: string, fetchLevel: number = 2): Promise<any[]> {
  try {
    console.log(`Fetching all non-anonymous donors with fetch level: ${fetchLevel}`);
    const client = createAuthenticatedClient(token);
    
    // Cast the query parameters to 'any' to bypass TypeScript checking
    const queryParams: any = {
      level: fetchLevel,
      donorWantToStayAnonymous: false
    };
    
    const response = await client.users.get({
      queryParameters: queryParams
    });
    return response?.users || [];
  } catch (error) {
    console.error('Error fetching all non-anonymous donors:', error);
    return [];
  }
}

/**
 * Get public non-anonymous donors
 * This function can be used without authentication
 * @param fetchLevel Controls the depth of data returned
 */
export async function getPublicNonAnonymousDonors(fetchLevel: number = 1): Promise<any[]> {
  try {
    console.log(`Fetching public non-anonymous donors with fetch level: ${fetchLevel}`);
    
    // Cast the query parameters to 'any' to bypass TypeScript checking
    const queryParams: any = {
      level: fetchLevel,
      donorWantToStayAnonymous: false,
      donorExcludedFromPublicPortal: false
    };
    
    const response = await anonymousClient.users.get({
      queryParameters: queryParams
    });
    return response?.users || [];
  } catch (error) {
    console.error('Error fetching public non-anonymous donors:', error);
    return getPublicNonAnonymousDonorsDirect(fetchLevel);
  }
}

/**
 * Direct fetch fallback for public non-anonymous donors
 * @param fetchLevel Level of data to fetch
 */
export async function getPublicNonAnonymousDonorsDirect(fetchLevel: number = 1): Promise<any[]> {
  try {
    console.log(`Attempting direct fetch for public non-anonymous donors with level: ${fetchLevel}`);
    const response = await fetch(`${API_BASE_URL}/api/Users?level=${fetchLevel}&donorWantToStayAnonymous=false&donorExcludedFromPublicPortal=false`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error in direct fetch for public non-anonymous donors:', error);
    return [];
  }
}

/**
 * Get non-anonymous donors filtered by blood type
 * @param bloodType Blood type to filter by (e.g., "A+", "O-")
 * @param token Optional authentication token
 * @param fetchLevel Level of data to fetch
 */
export async function getNonAnonymousDonorsByBloodType(
  bloodType: string, 
  token?: string, 
  fetchLevel: number = 1
): Promise<any[]> {
  try {
    console.log(`Fetching non-anonymous donors with blood type ${bloodType} and fetch level: ${fetchLevel}`);
    
    // Use authenticated client if token is provided, otherwise use anonymous client
    const client = token ? createAuthenticatedClient(token) : anonymousClient;
    
    // Cast the query parameters to 'any' to bypass TypeScript checking
    const queryParams: any = token 
      ? {
          level: fetchLevel,
          donorBloodGroup: bloodType,
          donorWantToStayAnonymous: false
        }
      : {
          level: fetchLevel,
          donorBloodGroup: bloodType,
          donorWantToStayAnonymous: false,
          donorExcludedFromPublicPortal: false
        };
    
    const response = await client.users.get({
      queryParameters: queryParams
    });
    return response?.users || [];
  } catch (error) {
    console.error(`Error fetching non-anonymous donors with blood type ${bloodType}:`, error);
    return [];
  }
}

/**
 * Get a specific non-anonymous donor's profile
 * @param userId User ID
 * @param token Optional authentication token (provides more details if authenticated)
 * @param fetchLevel Level of data to fetch
 */


/**
 * Search for non-anonymous donors
 * @param searchTerm Search term to find matching donors
 * @param token Optional authentication token
 * @param fetchLevel Level of data to fetch
 */
export async function searchNonAnonymousDonors(
  searchTerm: string, 
  token?: string, 
  fetchLevel: number = 1
): Promise<any[]> {
  try {
    console.log(`Searching non-anonymous donors with term "${searchTerm}" and fetch level: ${fetchLevel}`);
    
    // Use authenticated client if token is provided, otherwise use anonymous client
    const client = token ? createAuthenticatedClient(token) : anonymousClient;
    
    // Cast the query parameters to 'any' to bypass TypeScript checking
    const queryParams: any = token 
      ? {
          level: fetchLevel,
          search: searchTerm,
          donorWantToStayAnonymous: false
        }
      : {
          level: fetchLevel,
          search: searchTerm,
          donorWantToStayAnonymous: false,
          donorExcludedFromPublicPortal: false
        };
    
    const response = await client.users.get({
      queryParameters: queryParams
    });
    return response?.users || [];
  } catch (error) {
    console.error(`Error searching non-anonymous donors with term "${searchTerm}":`, error);
    return [];
  }
}