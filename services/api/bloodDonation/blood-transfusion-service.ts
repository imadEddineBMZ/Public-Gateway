import { anonymousClient, API_BASE_URL, createAuthenticatedClient } from '../core';
import { BloodTansfusionCenterDTO, ListBloodTansfusionCentersResponse } from '../../../client/models';

/**
 * Get all blood transfusion centers
 */
export async function getBloodTansfusionCenters(): Promise<BloodTansfusionCenterDTO[]> {
  try {
    const response = await anonymousClient.bTC.get() as ListBloodTansfusionCentersResponse;
    return response.bloodTansfusionCenters || [];
  } catch (error) {
    console.error('Error fetching blood transfusion centers:', error);
    return getBloodTansfusionCentersDirect();
  }
}

/**
 * Backup direct fetch for blood transfusion centers
 */
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

/**
 * Subscribe to a blood transfusion center
 */
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

/**
 * Unsubscribe from a blood transfusion center
 */
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

/**
 * Get blood transfusion centers the user is subscribed to
 */
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