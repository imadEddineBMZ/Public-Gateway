// Main API service barrel file - export all services from here for easy imports

// Core
export { 
  API_BASE_URL,
  anonymousClient, 
  createAuthenticatedClient 
} from './api/core';

// Authentication
export { 
  login, 
  register 
} from './api/auth/auth-service';

// Blood Transfusion Centers
export {
  getBloodTansfusionCenters,
  getBloodTansfusionCentersDirect,
  subscribeToBloodTansfusionCenter,
  unsubscribeFromBloodTansfusionCenter,
  getSubscribedBloodTansfusionCenters
} from './api/bloodDonation/blood-transfusion-service';

// Blood Donation Requests
export {
  getPublicBloodDonationRequests,
  getAuthenticatedBloodDonationRequests,
  getSubscribedHospitalRequests,
  getMatchingBloodTypeRequests,
  getRequestsByBloodTransfusionCenter,
  getNearbyRequests,
  createBloodDonationRequest,
  pledgeToDonate
} from './api/bloodDonation/blood-donation-requests-service';

// Donors
export {
  getAllNonAnonymousDonors,
  getPublicNonAnonymousDonors,
  getNonAnonymousDonorsByBloodType,
  searchNonAnonymousDonors
} from './api/donors/donors-service';

// Locations
export {
  getWilayas,
  getCommunes
} from './api/locations/locations-service';