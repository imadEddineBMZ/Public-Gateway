import { createAuthenticatedClient } from '../core';
import { BloodDonationPledgeDTO, CreatePledgeRequest } from '@/client/models';

/**
 * Fetch all pledges for the current user
 * @param token JWT authentication token
 * @param filter Optional filter parameters (evolutionStatus, etc.)
 */
export async function fetchUserPledges(
  token: string, 
  filter?: {
    evolutionStatus?: number;
    paginationTake?: number;
    paginationSkip?: number;
  }
): Promise<BloodDonationPledgeDTO[]> {
  try {
    console.log('[PLEDGES SERVICE] Fetching user pledges', filter);
    
    // Clean the token properly
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // Build URL with a JSON filter parameter
    let url = `https://localhost:57679/Pledges`;
    
    if (filter) {
      // Create a filter object with only defined properties
      const filterObj: Record<string, any> = {};
      if (filter.evolutionStatus !== undefined) filterObj.evolutionStatus = filter.evolutionStatus;
      if (filter.paginationTake !== undefined) filterObj.paginationTake = filter.paginationTake;
      if (filter.paginationSkip !== undefined) filterObj.paginationSkip = filter.paginationSkip;
      
      // Add the filter as a JSON-encoded parameter if there are properties
      if (Object.keys(filterObj).length > 0) {
        url += `?filter=${encodeURIComponent(JSON.stringify(filterObj))}`;
      }
    }
    
    console.log(`Requesting pledges with URL: ${url}`);
    
    // Direct fetch implementation
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pledge fetch error (${response.status}):`, errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Pledges response:', data);
    return data?.bloodDonationPledges || [];
  } catch (error) {
    console.error('[PLEDGES SERVICE] Error fetching pledges:', error);
    throw error;
  }
}

/**
 * Create a new pledge for a blood donation request
 * @param token Authentication token
 * @param pledgeData Pledge data including requestId, date and notes
 */
export async function createPledge(
  token: string, 
  pledgeData: {
    bloodDonationRequestId: string;
    pledgeDate?: string | Date;
    pledgeNotes?: string;
  }
): Promise<any> {
  try {
    console.log(`Creating pledge for request ID: ${pledgeData.bloodDonationRequestId}`);
    
    // Direct fetch implementation to bypass potential Kiota client issues
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    const requestData = {
      bloodDonationRequestId: pledgeData.bloodDonationRequestId,
      pledgeNotes: pledgeData.pledgeNotes,
      pledgeDate: pledgeData.pledgeDate 
        ? typeof pledgeData.pledgeDate === 'string' 
          ? new Date(pledgeData.pledgeDate).toISOString() 
          : pledgeData.pledgeDate.toISOString()
        : new Date().toISOString()
    };
    
    // Use a direct fetch call to ensure proper header formatting
    const response = await fetch(`https://localhost:57679/Pledges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw errorData;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error creating pledge:`, error);
    throw error;
  }
}

/**
 * Update a pledge's status
 * @param token JWT authentication token
 * @param pledgeId ID of the pledge to update
 * @param evolutionStatus New status (1=Honored, 2=CanceledByInitiator, etc.)
 * @param reason Optional reason for cancellation
 */
export async function updatePledgeStatus(
  token: string, 
  pledgeId: string, 
  evolutionStatus: number,
  reason?: string
): Promise<BloodDonationPledgeDTO | undefined> {
  try {
    console.log(`[PLEDGES SERVICE] Updating status for pledge ID: ${pledgeId} to status: ${evolutionStatus}`);
    
    // Clean token
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // Format request body exactly according to API expectations
    const requestData: any = {
      evolutionStatus: evolutionStatus,
      pledgeDate: new Date().toISOString()
    };
    
    // Include cantBeDoneReason when canceling (status 2, 3, 4)
    if (reason && (evolutionStatus === 2 || evolutionStatus === 3 || evolutionStatus === 4)) {
      requestData.cantBeDoneReason = reason;
    }
    
    const url = `https://localhost:57679/Pledges/${pledgeId}`;
    console.log(`[PLEDGES SERVICE] Sending PUT request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error updating pledge ${pledgeId}:`, errorData);
      throw errorData;
    }
    
    const data = await response.json();
    return data?.bloodDonationPledge;
  } catch (error) {
    console.error(`Error updating pledge:`, error);
    throw error;
  }
}

/**
 * Cancel a pledge
 * @param token JWT authentication token
 * @param pledgeId ID of the pledge to cancel
 * @param reason Reason for cancellation
 */
export async function cancelPledge(token: string, pledgeId: string, reason: string): Promise<BloodDonationPledgeDTO | undefined> {
  console.log(`[PLEDGES SERVICE] Cancelling pledge with ID: ${pledgeId}, reason: ${reason}`);
  
  // Instead of using updatePledgeStatus, use the more complete updatePledge function
  return updatePledge(token, pledgeId, {
    evolutionStatus: 2, // CanceledByInitiator
    cantBeDoneReason: reason,
    pledgeDate: new Date()
  });
}

/**
 * Mark a pledge as honored (completed)
 * @param token JWT authentication token
 * @param pledgeId ID of the pledge to mark as honored
 */
export async function completePledge(token: string, pledgeId: string): Promise<BloodDonationPledgeDTO | undefined> {
  console.log(`[PLEDGES SERVICE] Completing pledge with ID: ${pledgeId}`);
  
  // Status 1 = Honored
  return updatePledgeStatus(token, pledgeId, 1);
}

/**
 * Update a pledge with new information
 * @param token JWT authentication token
 * @param pledgeId ID of the pledge to update
 * @param updateData Data to update the pledge with
 */
export async function updatePledge(
  token: string,
  pledgeId: string,
  updateData: {
    bloodDonationRequestId?: string;
    pledgeDate?: string | Date;
    pledgeNotes?: string;
    evolutionStatus?: number;
    cantBeDoneReason?: string;
  }
): Promise<BloodDonationPledgeDTO | undefined> {
  try {
    console.log(`[PLEDGES SERVICE] Updating pledge with ID: ${pledgeId}`);
    
    // Clean the token properly
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // Get the pledgeDate from updateData or create future date if not provided
    let pledgeDate: Date;
    if (updateData.pledgeDate) {
      // Convert string date to Date if needed
      pledgeDate = typeof updateData.pledgeDate === 'string' 
        ? new Date(updateData.pledgeDate) 
        : updateData.pledgeDate;
      
      // Ensure date is in the future
      const now = new Date();
      if (pledgeDate <= now) {
        // If provided date is not in future, add one day to current date
        pledgeDate = new Date();
        pledgeDate.setDate(pledgeDate.getDate() + 1);
      }
    } else {
      // Default to tomorrow if no date provided
      pledgeDate = new Date();
      pledgeDate.setDate(pledgeDate.getDate() + 1);
    }
    
    // IMPORTANT: Only include the exact fields allowed by the API schema
    const requestData = {
      evolutionStatus: updateData.evolutionStatus || 0,
      pledgeDate: pledgeDate.toISOString()
    };
    
    const url = `https://localhost:57679/Pledges/${pledgeId}`;
    console.log(`[PLEDGES SERVICE] Sending PUT request to: ${url}`);
    console.log(`[PLEDGES SERVICE] Request data:`, requestData);
    
    // Direct fetch implementation
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error updating pledge ${pledgeId} (${response.status}):`, errorData);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Pledge ${pledgeId} updated successfully:`, data);
    return data?.bloodDonationPledge;
  } catch (error) {
    console.error(`[PLEDGES SERVICE] Error updating pledge ${pledgeId}:`, error);
    throw error;
  }
}