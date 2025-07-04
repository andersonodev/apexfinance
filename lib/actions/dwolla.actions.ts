"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;
  
  console.log("DWOLLA_ENV from process.env:", environment);
  console.log("All DWOLLA env vars:", {
    DWOLLA_ENV: process.env.DWOLLA_ENV,
    DWOLLA_KEY: process.env.DWOLLA_KEY ? 'exists' : 'missing',
    DWOLLA_SECRET: process.env.DWOLLA_SECRET ? 'exists' : 'missing',
    DWOLLA_BASE_URL: process.env.DWOLLA_BASE_URL
  });

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        `Dwolla environment should either be set to 'sandbox' or 'production'. Current value: '${environment}'`
      );
  }
};

// Initialize Dwolla client function to ensure proper error handling
const getDwollaClient = () => {
  try {
    console.log('🔧 Obtendo configuração do ambiente...');
    const environment = getEnvironment();
    const key = process.env.DWOLLA_KEY;
    const secret = process.env.DWOLLA_SECRET;

    if (!key || !secret) {
      const missingVars = [];
      if (!key) missingVars.push('DWOLLA_KEY');
      if (!secret) missingVars.push('DWOLLA_SECRET');
      throw new Error(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    }

    console.log('🔄 Inicializando cliente Dwolla...', {
      environment,
      keyLength: key.length,
      secretLength: secret.length,
      keyPrefix: key.substring(0, 8)
    });

    const client = new Client({
      environment,
      key,
      secret,
    });

    console.log('✅ Cliente Dwolla criado com sucesso');
    return client;
  } catch (error) {
    console.error('❌ Erro ao inicializar cliente Dwolla:', error);
    throw new Error(`Falha ao inicializar cliente Dwolla: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  try {
    const dwollaClient = getDwollaClient();
    return await dwollaClient
      .post(`customers/${options.customerId}/funding-sources`, {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      })
      .then((res: any) => res.headers.get("location"));
  } catch (err) {
    console.error("Creating a Funding Source Failed: ", err);
  }
};

export const createOnDemandAuthorization = async () => {
  try {
    const dwollaClient = getDwollaClient();
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    const authLink = onDemandAuthorization.body._links;
    return authLink;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
  }
};

export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    console.log('🔄 Iniciando criação de cliente Dwolla...');
    console.log('📋 Dados do cliente:', {
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      type: newCustomer.type,
      hasAddress1: !!newCustomer.address1,
      hasCity: !!newCustomer.city,
      hasState: !!newCustomer.state,
      hasPostalCode: !!newCustomer.postalCode,
      hasDateOfBirth: !!newCustomer.dateOfBirth,
      hasSsn: !!newCustomer.ssn
    });

    // Step 1: Initialize Dwolla client
    console.log('🔧 Inicializando cliente Dwolla...');
    const dwollaClient = getDwollaClient();
    console.log('✅ Cliente Dwolla inicializado com sucesso');

    // Step 2: Create customer
    console.log('👤 Criando cliente no Dwolla...');
    const response = await dwollaClient.post("customers", newCustomer);
    
    const location = response.headers.get("location");
    console.log('✅ Cliente Dwolla criado com sucesso!');
    console.log('🔗 Location URL:', location);
    
    if (!location) {
      throw new Error('Location header não retornado pelo Dwolla');
    }

    return location;
  } catch (err: any) {
    console.error("❌ Erro detalhado ao criar cliente Dwolla:");
    console.error("🔍 Tipo do erro:", typeof err);
    console.error("🔍 Mensagem:", err?.message);
    console.error("🔍 Status:", err?.status);
    console.error("🔍 Code:", err?.code);
    console.error("🔍 Body:", err?.body);
    
    if (err?.body?._embedded?.errors) {
      console.error("🔍 Erros de validação do Dwolla:");
      err.body._embedded.errors.forEach((error: any, index: number) => {
        console.error(`  ${index + 1}. ${error.code}: ${error.message}`);
        if (error.path) console.error(`     Campo: ${error.path}`);
      });
    }
    
    // Log the full error object for debugging
    console.error("🔍 Objeto de erro completo:", JSON.stringify(err, null, 2));
    
    // Throw a more descriptive error
    const errorMessage = err?.body?._embedded?.errors?.[0]?.message || 
                        err?.message || 
                        'Erro desconhecido ao criar cliente Dwolla';
                        
    throw new Error(`Falha ao criar cliente Dwolla: ${errorMessage}`);
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    const dwollaClient = getDwollaClient();
    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };
    return await dwollaClient
      .post("transfers", requestBody)
      .then((res: any) => res.headers.get("location"));
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};
