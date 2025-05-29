import { anonymousClient } from '../core';

/**
 * Get all wilayas (provinces)
 */
export async function getWilayas() {
  try {
    const response = await anonymousClient.wilayas.get();
    return response?.wilayas || [];
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    return [];
  }
}

/**
 * Get communes for a specific wilaya
 * @param wilayaId ID of the wilaya to get communes for
 */
export async function getCommunes(wilayaId: number) {
  try {
    const response = await anonymousClient.communes.byWilayaId(wilayaId).get();
    return response?.communes || [];
  } catch (error) {
    console.error(`Error fetching communes for wilaya ${wilayaId}:`, error);
    return [];
  }
}