'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
// Pluggy imports
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { pluggyApiClient } from "@/lib/pluggy-api";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    )

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    const user = await getUserInfo({ userId: session.userId }) 

    return parseStringify(user);
  } catch (error) {
    console.error('Erro no signIn:', error);
    return null;
  }
}

export const signUp = async ({ password, skipBankConnection, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;
  
  let newUserAccount;

  try {
    console.log('🔄 Iniciando processo de signup para:', email);
    console.log('🏦 Pular conexão bancária:', skipBankConnection);
    const { account, database } = await createAdminClient();

    // Step 1: Create Appwrite user
    console.log('📝 Criando usuário no Appwrite...');
    newUserAccount = await account.create(
      ID.unique(), 
      email, 
      password, 
      `${firstName} ${lastName}`
    );

    if(!newUserAccount) {
      throw new Error('Falha ao criar conta no Appwrite')
    }
    console.log('✅ Usuário Appwrite criado com sucesso:', newUserAccount.$id);

    let dwollaCustomerUrl = '';
    let dwollaCustomerId = '';

    // Step 2: Create Dwolla customer (opcional)
    if (!skipBankConnection) {
      console.log('💳 Criando cliente Dwolla...');
      try {
        dwollaCustomerUrl = await createDwollaCustomer({
          ...userData,
          type: 'personal'
        });

        if (dwollaCustomerUrl) {
          dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
          console.log('✅ Cliente Dwolla criado com sucesso:', dwollaCustomerUrl);
        } else {
          console.log('⚠️ Falha ao criar cliente Dwolla - continuando sem integração bancária');
        }
      } catch (dwollaError) {
        console.log('⚠️ Erro ao criar cliente Dwolla - continuando sem integração bancária:', dwollaError);
        // Continue sem Dwolla em caso de erro
      }
    } else {
      console.log('⏭️ Pulando criação do cliente Dwolla conforme solicitado');
    }

    // Step 3: Create user document in database
    console.log('📄 Criando documento do usuário no banco de dados...');
    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        userId: newUserAccount.$id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        dwollaCustomerId,
        dwollaCustomerUrl
      }
    )
    console.log('✅ Documento do usuário criado com sucesso:', newUser.$id);

    // Step 4: Create session
    console.log('🔐 Criando sessão...');
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    console.log('✅ Sessão criada com sucesso');

    return parseStringify(newUser);
  } catch (error: any) {
    console.error('❌ Erro no signup:', {
      message: error?.message,
      code: error?.code,
      type: error?.type,
      stack: error?.stack
    });
    
    // check if account has been created, if so, delete it
    if (newUserAccount?.$id) {
      try {
        console.log('🧹 Limpando conta Appwrite criada:', newUserAccount.$id);
        const { user } = await createAdminClient();
        await user.delete(newUserAccount.$id);
        console.log('✅ Conta Appwrite removida com sucesso');
      } catch (deleteError) {
        console.error('❌ Erro ao remover conta Appwrite:', deleteError);
      }
    }
    
    // Return a more specific error message
    throw new Error(error?.message || 'Erro inesperado durante o cadastro');
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id})

    return parseStringify(user);
  } catch (error) {
    console.log('No session found:', error)
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    console.error('Erro no logout:', error);
    return null;
  }
}

export const createPluggyItem = async ({ 
  user, 
  connectorId, 
  credentials,
  clientUserId 
}: CreatePluggyItemProps) => {
  try {
    console.log('🔗 Criando Item Pluggy para usuário:', user.$id);
    
    const itemResponse = await pluggyApiClient.createItem(
      connectorId,
      credentials,
      clientUserId || user.$id
    );

    console.log('✅ Item Pluggy criado com sucesso:', itemResponse.id);
    return parseStringify({ itemId: itemResponse.id, itemData: itemResponse });
  } catch (error) {
    console.error('❌ Erro ao criar Item Pluggy:', error);
    throw error;
  }
}

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  itemId,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        itemId,
        fundingSourceUrl,
        shareableId,
      }
    )

    return parseStringify(bankAccount);
  } catch (error) {
    console.log(error);
  }
}

export const processPluggyConnection = async ({
  itemId,
  user,
}: {
  itemId: string;
  user: User;
}) => {
  try {
    console.log('🔄 Processando conexão Pluggy para itemId:', itemId);
    
    // Obter informações das contas da Pluggy
    const accounts = await pluggyApiClient.getAccounts(itemId);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('Nenhuma conta encontrada para este item');
    }

    // Usar a primeira conta
    const accountData = accounts[0];
    console.log('💳 Conta encontrada:', accountData.name);

    // Criar token de processamento para Dwolla
    const processorToken = itemId;

    // Criar fonte de financiamento para Dwolla
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });
    
    if (!fundingSourceUrl) {
      throw new Error('Falha ao criar fonte de financiamento');
    }

    // Criar conta bancária no banco de dados
    await createBankAccount({
      userId: user.$id,
      bankId: accountData.itemId,
      accountId: accountData.id,
      itemId,
      fundingSourceUrl,
      shareableId: encryptId(accountData.id),
    });

    // Revalidar a página para refletir as mudanças
    revalidatePath("/");

    console.log('✅ Conexão Pluggy processada com sucesso');
    return parseStringify({
      pluggyConnection: "complete",
      accountId: accountData.id,
      bankName: accountData.name,
    });
  } catch (error) {
    console.error("❌ Erro ao processar conexão Pluggy:", error);
    throw error;
  }
}

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    )

    return parseStringify(banks.documents);
  } catch (error) {
    console.log(error)
  }
}

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('$id', [documentId])]
    )

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('accountId', [accountId])]
    )

    if(bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const getPluggyAccountInfo = async ({ itemId }: { itemId: string }) => {
  try {
    console.log('📊 Obtendo informações da conta Pluggy para itemId:', itemId);
    
    const accounts = await pluggyApiClient.getAccounts(itemId);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('Nenhuma conta encontrada');
    }

    const account = accounts[0];
    
    return parseStringify({
      id: account.id,
      name: account.name,
      officialName: account.marketingName || account.name,
      type: account.type,
      subtype: account.subtype,
      currentBalance: account.balance,
      availableBalance: account.creditData?.availableCreditLimit || account.balance,
      currency: account.currencyCode,
      institutionName: account.itemId, // Placeholder - será obtido do item
      mask: account.number.slice(-4), // Últimos 4 dígitos
    });
  } catch (error) {
    console.error('❌ Erro ao obter informações da conta Pluggy:', error);
    throw error;
  }
}