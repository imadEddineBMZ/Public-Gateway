import { anonymousClient, API_BASE_URL, createAuthenticatedClient } from '../core';

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