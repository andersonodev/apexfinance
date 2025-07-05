"use server";

// Pluggy imports
import { pluggyApiClient } from "../pluggy-api";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Get multiple bank accounts using Pluggy
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    console.log('📊 Obtendo contas bancárias para usuário:', userId);
    
    // get banks from db
    const banks = await getBanks({ userId });
    
    if (!banks || banks.length === 0) {
      console.log('⚠️ Nenhum banco encontrado para o usuário');
      return { data: [], totalBanks: 0, totalCurrentBalance: 0 };
    }

    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        try {
          // get each account info from Pluggy using itemId
          const pluggyAccounts = await pluggyApiClient.getAccounts(bank.itemId);
          
          if (!pluggyAccounts || pluggyAccounts.length === 0) {
            console.log('⚠️ Nenhuma conta encontrada para o banco:', bank.bankId);
            return null;
          }

          const accountData = pluggyAccounts[0]; // Use primeira conta

          const account = {
            id: accountData.id,
            availableBalance: accountData.creditData?.availableCreditLimit || accountData.balance,
            currentBalance: accountData.balance,
            institutionId: accountData.itemId,
            name: accountData.name,
            officialName: accountData.marketingName || accountData.name,
            mask: accountData.number?.slice(-4) || '****',
            type: accountData.type as string,
            subtype: accountData.subtype as string,
            appwriteItemId: bank.$id,
            shareableId: bank.shareableId,
          };

          return account;
        } catch (error) {
          console.error('❌ Erro ao processar banco:', bank.bankId, error);
          return null;
        }
      })
    );

    // Filter out null results
    const validAccounts = accounts.filter(account => account !== null);
    
    const totalBanks = validAccounts.length;
    const totalCurrentBalance = validAccounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);
    
    console.log('✅ Contas obtidas com sucesso:', validAccounts.length);
    return parseStringify({ data: validAccounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error('❌ Erro ao obter contas:', error);
    return { data: [], totalBanks: 0, totalCurrentBalance: 0 };
  }
};

// Get one bank account using Pluggy
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    console.log('📊 Obtendo conta bancária individual:', appwriteItemId);
    
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });
    
    if (!bank) {
      throw new Error('Banco não encontrado');
    }

    // get account info from Pluggy using itemId
    const pluggyAccounts = await pluggyApiClient.getAccounts(bank.itemId);
    
    if (!pluggyAccounts || pluggyAccounts.length === 0) {
      throw new Error('Nenhuma conta encontrada para este banco');
    }
    
    const accountData = pluggyAccounts[0];

    // get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = transferTransactionsData?.documents?.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      })
    ) || [];

    // get transactions from Pluggy
    const pluggyTransactions = await getPluggyTransactions({
      itemId: bank.itemId,
      accountId: accountData.id,
    }) || [];

    const account = {
      id: accountData.id,
      availableBalance: accountData.creditData?.availableCreditLimit || accountData.balance,
      currentBalance: accountData.balance,
      institutionId: accountData.itemId,
      name: accountData.name,
      officialName: accountData.marketingName || accountData.name,
      mask: accountData.number?.slice(-4) || '****',
      type: accountData.type as string,
      subtype: accountData.subtype as string,
      appwriteItemId: bank.$id,
      shareableId: bank.shareableId,
    };

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...pluggyTransactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    console.log('✅ Conta individual obtida com sucesso');
    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error('❌ Erro ao obter conta individual:', error);
    return { data: null, transactions: [] };
  }
};

// Get institution info (simplified for Pluggy)
export const getInstitution = async ({ institutionId }: getInstitutionProps) => {
  try {
    // Para Pluggy, usamos o nome da instituição diretamente
    return parseStringify({
      institution_id: institutionId,
      name: institutionId,
      primary_color: '#1f2937',
      logo: null,
    });
  } catch (error) {
    console.error('❌ Erro ao obter informações da instituição:', error);
    return null;
  }
};

// Get transactions from Pluggy
export const getPluggyTransactions = async ({ itemId, accountId }: GetPluggyTransactionsProps) => {
  try {
    console.log('💳 Obtendo transações Pluggy para itemId:', itemId, 'accountId:', accountId);
    
    // Get transactions for the account
    const transactions = await pluggyApiClient.getTransactions(accountId);

    const formattedTransactions = transactions.map((transaction: any) => ({
      id: transaction.id,
      name: transaction.description || 'Transação',
      paymentChannel: 'online',
      type: transaction.amount < 0 ? 'debit' : 'credit',
      accountId: transaction.accountId,
      amount: Math.abs(transaction.amount),
      pending: false,
      category: transaction.category || 'other',
      date: transaction.date,
      image: '',
    }));

    console.log('✅ Transações Pluggy obtidas:', formattedTransactions.length);
    return parseStringify(formattedTransactions);
  } catch (error) {
    console.error('❌ Erro ao obter transações Pluggy:', error);
    return [];
  }
};

// Função legacy compatível (mantida para compatibilidade)
export const getTransactions = async ({ itemId }: { itemId: string }) => {
  try {
    // Para manter compatibilidade, obtemos a primeira conta do item
    const accounts = await pluggyApiClient.getAccounts(itemId);
    if (!accounts || accounts.length === 0) {
      return [];
    }
    
    return getPluggyTransactions({ itemId, accountId: accounts[0].id });
  } catch (error) {
    console.error('❌ Erro na função legacy getTransactions:', error);
    return [];
  }
};
