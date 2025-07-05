import axios, { AxiosInstance } from 'axios';

interface PluggyConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

interface PluggyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PluggyConnectorResponse {
  id: string;
  name: string;
  primaryColor: string;
  institutionUrl: string;
  country: string;
  type: string;
  credentials: PluggyCredential[];
  hasMFA: boolean;
  health: {
    status: string;
    stage: string;
  };
  products: string[];
  createdAt: string;
  updatedAt: string;
}

interface PluggyCredential {
  label: string;
  name: string;
  type: string;
  mfa?: boolean;
  assistiveText?: string;
  placeholder?: string;
  validation?: string;
  validationMessage?: string;
  options?: PluggyCredentialOption[];
}

interface PluggyCredentialOption {
  label: string;
  value: string;
}

interface PluggyItemResponse {
  id: string;
  connector: PluggyConnectorResponse;
  createdAt: string;
  updatedAt: string;
  status: string;
  executionStatus: string;
  lastUpdatedAt: string;
  webhookUrl?: string;
  clientUserId?: string;
  userAction?: any;
  parameter?: string;
  products: string[];
}

interface PluggyAccountResponse {
  id: string;
  itemId: string;
  type: string;
  subtype: string;
  number: string;
  name: string;
  marketingName?: string;
  balance: number;
  currencyCode: string;
  bankData?: {
    transferNumber?: string;
    closingBalance?: number;
  };
  creditData?: {
    level?: string;
    brand?: string;
    balanceCloseDate?: string;
    balanceDueDate?: string;
    availableCreditLimit?: number;
    balanceForeignCurrency?: number;
    minimumPayment?: number;
    creditLimit?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PluggyTransactionResponse {
  id: string;
  accountId: string;
  description: string;
  descriptionRaw?: string;
  currencyCode: string;
  amount: number;
  date: string;
  balance?: number;
  category?: string;
  categoryId?: string;
  providerCode?: string;
  paymentData?: {
    payer?: {
      name?: string;
      branchNumber?: string;
      accountNumber?: string;
      routingNumber?: string;
      documentNumber?: {
        type?: string;
        value?: string;
      };
    };
    paymentMethod?: string;
    referenceNumber?: string;
    reason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

class PluggyApiClient {
  private client: AxiosInstance;
  private config: PluggyConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(config: PluggyConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use(async (config) => {
      await this.ensureValidToken();
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Interceptor para renovar token se expirado
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.accessToken = null;
          this.tokenExpiresAt = null;
          await this.ensureValidToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async ensureValidToken(): Promise<void> {
    if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return; // Token ainda válido
    }

    await this.authenticate();
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post(`${this.config.baseUrl}/auth`, {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      });

      const data: PluggyAuthResponse = response.data;
      this.accessToken = data.access_token;
      
      // Definir expiração com margem de segurança (5 minutos antes)
      const expiresIn = data.expires_in - 300;
      this.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
      
      console.log('✅ Autenticação Pluggy realizada com sucesso');
    } catch (error: any) {
      console.error('❌ Falha na autenticação com Pluggy:', error.response?.data || error.message);
      throw new Error('Não foi possível autenticar com a API da Pluggy');
    }
  }

  // Obter todos os conectores (bancos) disponíveis
  async getConnectors(country = 'BR'): Promise<PluggyConnectorResponse[]> {
    try {
      const response = await this.client.get('/connectors', {
        params: { countries: country }
      });

      return response.data.results || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter conectores da Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao obter lista de conectores');
    }
  }

  // Criar um item (conexão com banco)
  async createItem(connectorId: string, credentials: Record<string, string>, clientUserId?: string): Promise<PluggyItemResponse> {
    try {
      const response = await this.client.post('/items', {
        connectorId,
        credentials,
        clientUserId: clientUserId || `user_${Date.now()}`,
        products: ['ACCOUNTS', 'TRANSACTIONS']
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar item na Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao criar conexão com a instituição bancária');
    }
  }

  // Obter informações de um item
  async getItem(itemId: string): Promise<PluggyItemResponse> {
    try {
      const response = await this.client.get(`/items/${itemId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter item da Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao obter informações do item');
    }
  }

  // Obter contas de um item
  async getAccounts(itemId: string): Promise<PluggyAccountResponse[]> {
    try {
      const response = await this.client.get('/accounts', {
        params: { itemId }
      });

      return response.data.results || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter contas da Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao obter informações das contas');
    }
  }

  // Obter transações de uma conta
  async getTransactions(accountId: string, from?: string, to?: string): Promise<PluggyTransactionResponse[]> {
    try {
      const params: any = { accountId };
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await this.client.get('/transactions', { params });

      return response.data.results || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter transações da Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao obter transações');
    }
  }

  // Atualizar um item (sincronizar dados)
  async updateItem(itemId: string): Promise<PluggyItemResponse> {
    try {
      const response = await this.client.patch(`/items/${itemId}`, {
        products: ['ACCOUNTS', 'TRANSACTIONS']
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar item na Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao atualizar dados do item');
    }
  }

  // Deletar um item
  async deleteItem(itemId: string): Promise<void> {
    try {
      await this.client.delete(`/items/${itemId}`);
    } catch (error: any) {
      console.error('❌ Erro ao deletar item na Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao deletar item');
    }
  }

  // Obter detalhes de um conector específico
  async getConnector(connectorId: string): Promise<PluggyConnectorResponse> {
    try {
      const response = await this.client.get(`/connectors/${connectorId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter conector da Pluggy:', error.response?.data || error.message);
      throw new Error('Falha ao obter informações do conector');
    }
  }
}

// Instância singleton do cliente Pluggy
const pluggyConfig: PluggyConfig = {
  clientId: process.env.PLUGGY_CLIENT_ID || '',
  clientSecret: process.env.PLUGGY_CLIENT_SECRET || '',
  baseUrl: process.env.PLUGGY_BASE_URL || 'https://api.pluggy.ai',
};

export const pluggyApiClient = new PluggyApiClient(pluggyConfig);

// Exportar tipos para uso em outros arquivos
export type {
  PluggyConnectorResponse,
  PluggyItemResponse,
  PluggyAccountResponse,
  PluggyTransactionResponse,
  PluggyConfig,
  PluggyAuthResponse,
  PluggyCredential,
  PluggyCredentialOption
};

export default PluggyApiClient;
