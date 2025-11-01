import { apiClient, handleApiResponse, handleApiError } from './api';

class WalletService {
  // Get wallet balance
  async getBalance() {
    try {
      const response = await apiClient.get('/wallet/balance/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Fund wallet
  async fundWallet(amount, paymentMethod, cardDetails = null) {
    try {
      const response = await apiClient.post('/wallet/fund/', {
        amount,
        payment_method: paymentMethod,
        card_details: cardDetails,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get transaction history
  async getTransactionHistory(params = {}) {
    try {
      const response = await apiClient.get('/wallet/transactions/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Withdraw from wallet
  async withdrawFunds(amount, bankDetails) {
    try {
      const response = await apiClient.post('/wallet/withdraw/', {
        amount,
        bank_details: bankDetails,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Transfer funds to another user
  async transferFunds(recipientId, amount, description = '') {
    try {
      const response = await apiClient.post('/wallet/transfer/', {
        recipient_id: recipientId,
        amount,
        description,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default new WalletService();