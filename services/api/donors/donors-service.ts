import { anonymousClient, API_BASE_URL, createAuthenticatedClient } from '../core';

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