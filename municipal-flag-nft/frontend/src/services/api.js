/**
 * API Service for backend communication
 */
import axios from 'axios';
import config from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

// =============================================================================
// COUNTRIES
// =============================================================================

export const getCountries = (visibleOnly = true) =>
  api.get('/countries', { params: { visible_only: visibleOnly } });

export const getCountry = (id) =>
  api.get(`/countries/${id}`);

export const createCountry = (data, adminKey) =>
  api.post('/countries', data, { headers: { 'X-Admin-Key': adminKey } });

export const updateCountry = (id, data, adminKey) =>
  api.put(`/countries/${id}`, data, { headers: { 'X-Admin-Key': adminKey } });

export const deleteCountry = (id, adminKey) =>
  api.delete(`/countries/${id}`, { headers: { 'X-Admin-Key': adminKey } });

// =============================================================================
// REGIONS
// =============================================================================

export const getRegions = (countryId = null, visibleOnly = true) =>
  api.get('/regions', { params: { country_id: countryId, visible_only: visibleOnly } });

export const getRegion = (id) =>
  api.get(`/regions/${id}`);

export const createRegion = (data, adminKey) =>
  api.post('/regions', data, { headers: { 'X-Admin-Key': adminKey } });

export const updateRegion = (id, data, adminKey) =>
  api.put(`/regions/${id}`, data, { headers: { 'X-Admin-Key': adminKey } });

export const deleteRegion = (id, adminKey) =>
  api.delete(`/regions/${id}`, { headers: { 'X-Admin-Key': adminKey } });

// =============================================================================
// MUNICIPALITIES
// =============================================================================

export const getMunicipalities = (regionId = null, visibleOnly = true) =>
  api.get('/municipalities', { params: { region_id: regionId, visible_only: visibleOnly } });

export const getMunicipality = (id) =>
  api.get(`/municipalities/${id}`);

export const createMunicipality = (data, adminKey) =>
  api.post('/municipalities', data, { headers: { 'X-Admin-Key': adminKey } });

export const updateMunicipality = (id, data, adminKey) =>
  api.put(`/municipalities/${id}`, data, { headers: { 'X-Admin-Key': adminKey } });

export const deleteMunicipality = (id, adminKey) =>
  api.delete(`/municipalities/${id}`, { headers: { 'X-Admin-Key': adminKey } });

// =============================================================================
// FLAGS
// =============================================================================

export const getFlags = (municipalityId = null, category = null, availableOnly = false) =>
  api.get('/flags', {
    params: {
      municipality_id: municipalityId,
      category,
      available_only: availableOnly,
    },
  });

export const getFlag = (id) =>
  api.get(`/flags/${id}`);

export const createFlag = (data, adminKey) =>
  api.post('/flags', data, { headers: { 'X-Admin-Key': adminKey } });

export const updateFlag = (id, data, adminKey) =>
  api.put(`/flags/${id}`, data, { headers: { 'X-Admin-Key': adminKey } });

// Flag interactions
export const registerInterest = (flagId, walletAddress) =>
  api.post(`/flags/${flagId}/interest`, { wallet_address: walletAddress });

export const getFlagInterests = (flagId) =>
  api.get(`/flags/${flagId}/interests`);

export const claimFirstNFT = (flagId, walletAddress, transactionHash) =>
  api.post(`/flags/${flagId}/claim`, {
    wallet_address: walletAddress,
    ownership_type: 'first',
    transaction_hash: transactionHash,
  });

export const purchaseSecondNFT = (flagId, walletAddress, transactionHash) =>
  api.post(`/flags/${flagId}/purchase`, {
    wallet_address: walletAddress,
    ownership_type: 'second',
    transaction_hash: transactionHash,
  });

export const getFlagOwnerships = (flagId) =>
  api.get(`/flags/${flagId}/ownerships`);

// =============================================================================
// USERS
// =============================================================================

export const getUser = (walletAddress) =>
  api.get(`/users/${walletAddress}`);

export const createOrGetUser = (walletAddress, username = null) =>
  api.post('/users', { wallet_address: walletAddress, username });

export const updateUser = (walletAddress, data) =>
  api.put(`/users/${walletAddress}`, data);

export const getUserFlags = (walletAddress) =>
  api.get(`/users/${walletAddress}/flags`);

export const getUserInterests = (walletAddress) =>
  api.get(`/users/${walletAddress}/interests`);

// Social
export const followUser = (walletAddress, targetWallet) =>
  api.post(`/users/${walletAddress}/follow`, { target_wallet: targetWallet });

export const unfollowUser = (walletAddress, targetWallet) =>
  api.delete(`/users/${walletAddress}/follow/${targetWallet}`);

export const getFollowers = (walletAddress) =>
  api.get(`/users/${walletAddress}/followers`);

export const getFollowing = (walletAddress) =>
  api.get(`/users/${walletAddress}/following`);

// =============================================================================
// AUCTIONS
// =============================================================================

export const getAuctions = (activeOnly = true, flagId = null) =>
  api.get('/auctions', { params: { active_only: activeOnly, flag_id: flagId } });

export const getAuction = (id) =>
  api.get(`/auctions/${id}`);

export const createAuction = (data) =>
  api.post('/auctions', data);

export const placeBid = (auctionId, walletAddress, amount) =>
  api.post(`/auctions/${auctionId}/bid`, {
    wallet_address: walletAddress,
    amount: amount.toString(),
  });

export const closeAuction = (auctionId) =>
  api.post(`/auctions/${auctionId}/close`);

export const cancelAuction = (auctionId, walletAddress) =>
  api.post(`/auctions/${auctionId}/cancel`, null, {
    params: { wallet_address: walletAddress },
  });

// =============================================================================
// RANKINGS
// =============================================================================

export const getUserRankings = (limit = 10) =>
  api.get('/rankings/users', { params: { limit } });

export const getCollectorRankings = (limit = 10) =>
  api.get('/rankings/collectors', { params: { limit } });

export const getPopularFlags = (limit = 10) =>
  api.get('/rankings/flags', { params: { limit } });

export const getActiveCollectors = (limit = 10) =>
  api.get('/rankings/active-collectors', { params: { limit } });

// =============================================================================
// ADMIN
// =============================================================================

export const getAdminStats = (adminKey) =>
  api.get('/admin/stats', { headers: { 'X-Admin-Key': adminKey } });

export const seedDemoData = (adminKey) =>
  api.post('/admin/seed', null, { headers: { 'X-Admin-Key': adminKey } });

export const resetDatabase = (adminKey) =>
  api.post('/admin/reset', null, { headers: { 'X-Admin-Key': adminKey } });

export const healthCheck = () =>
  api.get('/admin/health');

export default api;
