import { anonymousClient, API_BASE_URL, createAuthenticatedClient } from '../core';
import { BloodTansfusionCenterDTO, ListBloodTansfusionCentersResponse } from '../../../client/models';

/**
 * Get all blood transfusion centers
 * @param token Optional authentication token to get personalized subscription status
 */
export async function getBloodTansfusionCenters(token?: string): Promise<BloodTansfusionCenterDTO[]> {
  try {
    // Use authenticated client if token is provided, otherwise use anonymous
    const client = token ? createAuthenticatedClient(token) : anonymousClient;
    const response = await client.bTC.get() as ListBloodTansfusionCentersResponse;
    return response.bloodTansfusionCenters || [];
  } catch (error) {
    console.error('Error fetching blood transfusion centers:', error);
    
    // Fall back to direct fetch method
    return token 
      ? getBloodTansfusionCentersDirectAuthenticated(token) 
      : getBloodTansfusionCentersDirect();
  }
}

/**
 * Backup direct fetch for blood transfusion centers
 */
export async function getBloodTansfusionCentersDirect(): Promise<any[]> {
  try {
    console.log('Attempting direct fetch to:', `${API_BASE_URL}/BTC`);
    const response = await fetch(`${API_BASE_URL}/BTC`, {
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

/**
 * Backup direct fetch for blood transfusion centers with authentication
 */
export async function getBloodTansfusionCentersDirectAuthenticated(token: string): Promise<any[]> {
  try {
    console.log('Attempting authenticated direct fetch to:', `${API_BASE_URL}/BTC`);
    
    // Clean token if it has Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    console.log('Using cleaned token:', cleanToken);
    
    const response = await fetch(`${API_BASE_URL}/BTC`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Authenticated direct fetch response:', data);
    return data.bloodTansfusionCenters || [];
  } catch (error) {
    console.error('Error in authenticated direct fetch:', error);
    return getBloodTansfusionCentersDirect(); // Fall back to anonymous fetch
  }
}

/**
 * Subscribe to a blood transfusion center
 * @param token JWT authentication token
 * @param bloodTansfusionCenterId ID of the blood transfusion center to subscribe to
 * @returns The subscription ID for the newly created subscription
 */
export async function subscribeToBloodTansfusionCenter(token: string, bloodTansfusionCenterId: string): Promise<string | null> {
  try {
    console.log(`[BTC SERVICE] Subscribing to blood transfusion center ID: ${bloodTansfusionCenterId}`);
    
    // Clean token if it has Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // Request body
    const requestBody = {
      bloodTansfusionCenterId: bloodTansfusionCenterId
    };
    
    console.log(`[BTC SERVICE] Request body:`, requestBody);
    
    // Use direct fetch implementation instead of client for better control
    const response = await fetch(`${API_BASE_URL}/Subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Log the status code for debugging
    console.log(`[BTC SERVICE] Subscription API response status: ${response.status}`);
    
    if (!response.ok) {
      // Read response as text first to avoid JSON parsing errors
      const errorText = await response.text();
      console.error(`[BTC SERVICE] Subscription error (${response.status}):`, errorText);
      
      // Try to parse as JSON if possible, otherwise use the text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || `HTTP error ${response.status}` };
      }
      
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    // Check if there's any content before trying to parse JSON
    const contentLength = response.headers.get('content-length');
    const hasContent = contentLength !== '0' && contentLength !== null;
    
    if (hasContent) {
      const responseText = await response.text();
      console.log(`[BTC SERVICE] Subscription successful, response:`, responseText);
      
      try {
        // Only try to parse if we have content
        if (responseText.trim()) {
          const data = JSON.parse(responseText);
          // Return the subscription ID which we'll need for unsubscribing
          return data?.subscription?.id || null;
        }
        return null; // Empty but successful response
      } catch (e) {
        console.warn(`[BTC SERVICE] Could not parse response as JSON:`, e);
        return null; // Return null for non-JSON responses
      }
    } else {
      console.log(`[BTC SERVICE] Subscription successful, no content returned`);
      return null; // No content
    }
  } catch (error) {
    console.error('[BTC SERVICE] Error subscribing to blood transfusion center:', error);
    throw error;
  }
}

/**
 * Unsubscribe from a blood transfusion center
 * @param token JWT authentication token
 * @param btcId ID of the blood transfusion center to unsubscribe from
 * @returns A boolean indicating success
 */
export async function unsubscribeFromBloodTansfusionCenter(token: string, btcId: string): Promise<boolean> {
  try {
    console.log(`[BTC SERVICE] Unsubscribing from blood transfusion center ID: ${btcId}`);
    
    // Clean token if it has Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // Use direct fetch for better error handling
    const response = await fetch(`${API_BASE_URL}/Subscriptions/btc/${btcId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json'
      }
    });
    
    console.log(`[BTC SERVICE] Unsubscribe API response status: ${response.status}`);
    
    if (!response.ok) {
      // Read response as text first to avoid JSON parsing errors
      const errorText = await response.text();
      console.error(`[BTC SERVICE] Unsubscribe error (${response.status}):`, errorText);
      
      // Try to parse as JSON if possible, otherwise use the text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || `HTTP error ${response.status}` };
      }
      
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    console.log(`[BTC SERVICE] Successfully unsubscribed from BTC ID: ${btcId}`);
    return true;
  } catch (error) {
    console.error('[BTC SERVICE] Error unsubscribing from blood transfusion center:', error);
    throw error;
  }
}

/**
 * Get blood transfusion centers the user is subscribed to
 */
export async function getSubscribedBloodTansfusionCenters(token: string, level: number = 1, paginationTake: number = 50) {
  try {
    const client = createAuthenticatedClient(token);
    const response = await client.bTC.subscribed.get({
      queryParameters: {
        level: level,
        paginationTake: paginationTake
      }
    });
    return response?.btCsubscribed || [];
  } catch (error) {
    console.error('[BTC SERVICE] Error fetching subscribed BTC centers with client:', error);
    // Fall back to direct fetch implementation
    return getSubscribedBloodTansfusionCentersDirect(token, level, paginationTake);
  }
}

/**
 * Direct fetch fallback for subscribed blood transfusion centers
 */
export async function getSubscribedBloodTansfusionCentersDirect(token: string, level: number = 1, paginationTake: number = 50) {
  try {
    console.log(`[BTC SERVICE] Attempting direct fetch for subscribed centers with level: ${level}`);
    
    // Clean token if it has Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    const response = await fetch(`https://localhost:57679/BTC/subscribed?&level=${level}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[BTC SERVICE] Direct fetch for subscribed centers successful:', data);
    return data.btCsubscribed || [];
  } catch (error) {
    console.error('[BTC SERVICE] Error in direct fetch for subscribed centers:', error);
    return [];
  }
}