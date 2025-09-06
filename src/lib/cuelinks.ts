const CUELINKS_API_KEY = import.meta.env.VITE_CUELINKS_API_KEY;
const CUELINKS_BASE_URL = import.meta.env.VITE_CUELINKS_BASE_URL || 'https://api.cuelinks.com';

export interface CuelinksResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface AffiliateLink {
  originalUrl: string;
  affiliateUrl: string;
  brand?: string;
  commissionRate?: number;
}

export interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  thisMonthEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
}

export interface TransactionData {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  description: string;
}

class CuelinksAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!CUELINKS_API_KEY) {
      throw new Error('Cuelinks API key is required');
    }
    this.apiKey = CUELINKS_API_KEY;
    this.baseUrl = CUELINKS_BASE_URL;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<CuelinksResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'API request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateAffiliateLink(originalUrl: string): Promise<AffiliateLink | null> {
    const response = await this.makeRequest('/v1/links/create', {
      method: 'POST',
      body: JSON.stringify({
        url: originalUrl,
      }),
    });

    if (response.success && response.data) {
      return {
        originalUrl,
        affiliateUrl: response.data.shortUrl || response.data.affiliateUrl,
        brand: response.data.brand,
        commissionRate: response.data.commissionRate,
      };
    }

    return null;
  }

  async getEarnings(userId?: string): Promise<EarningsData | null> {
    const response = await this.makeRequest('/v1/earnings', {
      method: 'GET',
    });

    if (response.success && response.data) {
      return {
        totalEarnings: response.data.totalEarnings || 0,
        pendingEarnings: response.data.pendingEarnings || 0,
        thisMonthEarnings: response.data.thisMonthEarnings || 0,
        availableBalance: response.data.availableBalance || 0,
        totalWithdrawn: response.data.totalWithdrawn || 0,
      };
    }

    return null;
  }

  async getTransactions(): Promise<TransactionData[]> {
    const response = await this.makeRequest('/v1/transactions', {
      method: 'GET',
    });

    if (response.success && response.data?.transactions) {
      return response.data.transactions.map((transaction: any) => ({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        date: transaction.createdAt,
        description: transaction.description || `${transaction.type} transaction`,
      }));
    }

    return [];
  }

  async requestWithdrawal(amount: number, paymentMethod: string): Promise<boolean> {
    const response = await this.makeRequest('/v1/withdrawals', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        paymentMethod,
      }),
    });

    return response.success;
  }

  async getAnalytics(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await this.makeRequest(`/v1/analytics?${params.toString()}`, {
      method: 'GET',
    });

    if (response.success) {
      return response.data;
    }

    return null;
  }

  async getBrands(): Promise<any[]> {
    const response = await this.makeRequest('/v1/brands', {
      method: 'GET',
    });

    if (response.success && response.data?.brands) {
      return response.data.brands;
    }

    return [];
  }

  async searchProducts(query: string): Promise<any[]> {
    const response = await this.makeRequest(`/v1/products/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });

    if (response.success && response.data?.products) {
      return response.data.products;
    }

    return [];
  }
}

export const cuelinksAPI = new CuelinksAPI();