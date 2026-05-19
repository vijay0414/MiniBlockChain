import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getChain = () => api.get('/chain');
export const getPendingTransactions = () => api.get('/transaction');
export const addTransaction = (transaction) => api.post('/transaction', transaction);
export const minePendingTransactions = (minerAddress) => api.get(`/mine`, { params: { minerAddress } });
export const getWalletBalance = (address) => api.get('/balance', { params: { address } });
export const generateNewWallet = () => api.get('/wallet/new');
export const signTransactionData = (data) => api.post('/wallet/sign', data);
export const checkChainValidity = () => api.get('/validate');
export const getMinerPublicKey = () => api.get('/miner/public-key');

export default api;
