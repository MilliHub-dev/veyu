import { apiClient, handleApiResponse, handleApiError } from './api';

class WalletService {
  // Get wallet overview (balance + recent transactions)
  async getWalletOverview() {
    try {
      const response = await apiClient.get('/wallet/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get wallet balance
  async getBalance() {
    try {
      const response = await apiClient.get('/wallet/balance/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get transactions with filtering support
  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get('/wallet/transactions/', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get transaction summary
  async getTransactionSummary() {
    try {
      const response = await apiClient.get('/wallet/transactions/summary/');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Get transaction analytics (admin only)
  async getTransactionAnalytics(days = 30) {
    try {
      const response = await apiClient.get('/wallet/analytics/', { 
        params: { days } 
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Deposit funds
  async deposit(amount, paymentMethod, paymentReference = null) {
    try {
      const response = await apiClient.post('/wallet/deposit/', {
        amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Withdraw funds
  async withdraw(amount, bankAccount) {
    try {
      const response = await apiClient.post('/wallet/withdraw/', {
        amount,
        bank_account: bankAccount,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Transfer funds to another user
  async transfer(recipientId, amount, description = '', pin = null) {
    try {
      const response = await apiClient.post('/wallet/transfer/', {
        recipient_id: recipientId,
        amount,
        description,
        pin,
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  // Legacy methods for backward compatibility
  async fundWallet(amount, paymentMethod, cardDetails = null) {
    return this.deposit(amount, paymentMethod, cardDetails);
  }

  async getTransactionHistory(params = {}) {
    return this.getTransactions(params);
  }

  async withdrawFunds(amount, bankDetails) {
    return this.withdraw(amount, bankDetails);
  }

  async transferFunds(recipientId, amount, description = '') {
    return this.transfer(recipientId, amount, description);
  }
}

export default new WalletService();
