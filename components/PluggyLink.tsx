'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation';
import { createPluggyItem, processPluggyConnection } from '@/lib/actions/user.actions';
import { pluggyApiClient } from '@/lib/pluggy-api';
import Image from 'next/image';

interface PluggyLinkProps {
  user: User;
  variant?: 'primary' | 'ghost' | 'default';
}

interface PluggyConnector {
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

const PluggyLink = ({ user, variant = 'primary' }: PluggyLinkProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [connectors, setConnectors] = useState<PluggyConnector[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<PluggyConnector | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select-bank' | 'credentials'>('select-bank');

  // Carregar conectores quando o formulário for aberto
  useEffect(() => {
    if (showBankForm && connectors.length === 0) {
      loadConnectors();
    }
  }, [showBankForm]);

  const loadConnectors = async () => {
    try {
      setIsLoading(true);
      const connectorsData = await pluggyApiClient.getConnectors('BR');
      // Filtrar apenas bancos ativos
      const activeConnectors = connectorsData.filter(
        connector => connector.health.status === 'ONLINE' && connector.type === 'PERSONAL_BANK'
      );
      setConnectors(activeConnectors);
    } catch (error) {
      console.error('❌ Erro ao carregar conectores:', error);
      setError('Erro ao carregar lista de bancos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    setShowBankForm(true);
    setError('');
    setStep('select-bank');
  };

  const handleBankSelect = (connector: PluggyConnector) => {
    setSelectedConnector(connector);
    setCredentials({});
    setStep('credentials');
    setError('');
  };

  const handleCredentialChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedConnector) {
      setError('Por favor, selecione um banco');
      return;
    }

    // Validar se todos os campos obrigatórios foram preenchidos
    const requiredFields = selectedConnector.credentials.filter(cred => !cred.mfa);
    const missingFields = requiredFields.filter(field => !credentials[field.name]);
    
    if (missingFields.length > 0) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔗 Iniciando conexão Pluggy...');
      
      // Criar item no Pluggy
      const itemResult = await createPluggyItem({
        user,
        connectorId: selectedConnector.id,
        credentials,
        clientUserId: user.$id
      });

      if (itemResult?.itemId) {
        console.log('✅ Item criado com sucesso:', itemResult.itemId);
        
        // Processar a conexão e criar conta bancária
        await processPluggyConnection({
          itemId: itemResult.itemId,
          user
        });

        console.log('✅ Conexão Pluggy processada com sucesso');
        router.push('/');
      } else {
        throw new Error('Falha ao criar item Pluggy');
      }
    } catch (error: any) {
      console.error('❌ Erro na conexão Pluggy:', error);
      const errorMessage = error?.message || 'Erro ao conectar com o banco. Verifique suas credenciais e tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowBankForm(false);
    setSelectedConnector(null);
    setCredentials({});
    setError('');
    setStep('select-bank');
  };

  const handleBack = () => {
    setStep('select-bank');
    setSelectedConnector(null);
    setCredentials({});
    setError('');
  };

  // Se mostrar o formulário bancário
  if (showBankForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'select-bank' ? 'Conectar Conta Bancária' : selectedConnector?.name}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 text-xl"
                disabled={isLoading}
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Conecte-se ao seu banco através da API segura da Pluggy
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {step === 'select-bank' ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Selecione seu banco:
                </h3>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Carregando bancos...</span>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {connectors.map((connector) => (
                      <button
                        key={connector.id}
                        onClick={() => handleBankSelect(connector)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-3"
                        disabled={isLoading}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: connector.primaryColor || '#6366f1' }}
                        >
                          {connector.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{connector.name}</p>
                          <p className="text-xs text-gray-500">
                            Status: {connector.health.status === 'ONLINE' ? '✅ Online' : '⚠️ Instável'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {step === 'credentials' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mb-4"
                  >
                    ← Voltar para seleção de banco
                  </button>
                )}
                
                {selectedConnector?.credentials.map((credential) => (
                  <div key={credential.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {credential.label} {!credential.mfa && '*'}
                    </label>
                    
                    {credential.type === 'select' && credential.options ? (
                      <select
                        value={credentials[credential.name] || ''}
                        onChange={(e) => handleCredentialChange(credential.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required={!credential.mfa}
                        disabled={isLoading}
                      >
                        <option value="">Selecione uma opção</option>
                        {credential.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={credential.type === 'password' ? 'password' : 'text'}
                        value={credentials[credential.name] || ''}
                        onChange={(e) => handleCredentialChange(credential.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={credential.placeholder || credential.label}
                        required={!credential.mfa}
                        disabled={isLoading}
                      />
                    )}
                    
                    {credential.assistiveText && (
                      <p className="text-xs text-gray-500 mt-1">{credential.assistiveText}</p>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Conectando...
                      </div>
                    ) : (
                      'Conectar'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 text-lg">🔒</div>
                <div>
                  <p className="text-xs text-blue-700 font-medium">Segurança Garantida</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Suas credenciais são criptografadas e processadas através da API oficial da Pluggy. 
                    Seus dados bancários ficam seguros e protegidos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Botões de conexão
  return (
    <>
      {variant === 'primary' ? (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="plaidlink-primary"
        >
          {isLoading ? 'Carregando...' : 'Conectar banco'}
        </Button>
      ): variant === 'ghost' ? (
        <Button onClick={handleConnect} variant="ghost" className="plaidlink-ghost">
          <Image 
            src="/icons/connect-bank.svg"
            alt="conectar banco"
            width={24}
            height={24}
          />
          <p className='hidden text-[16px] font-semibold text-black-2 xl:block'>Conectar banco</p>
        </Button>
      ): (
        <Button onClick={handleConnect} className="plaidlink-default">
          <Image 
            src="/icons/connect-bank.svg"
            alt="conectar banco"
            width={24}
            height={24}
          />
          <p className='text-[16px] font-semibold text-black-2'>Conectar banco</p>
        </Button>
      )}
    </>
  )
}

export default PluggyLink
