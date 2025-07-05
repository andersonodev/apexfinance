'use client';

import React from 'react'
import { Button } from './ui/button'
import PluggyLink from './PluggyLink'
import Image from 'next/image'

interface EmptyBankStateProps {
  user: User
}

const EmptyBankState = ({ user }: EmptyBankStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Image
            src="/icons/connect-bank.svg"
            alt="Connect Bank"
            width={120}
            height={120}
            className="mx-auto mb-4 opacity-50"
          />
        </div>
        
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-24 text-gray-900 font-semibold mb-2">
              Bem-vindo ao Horizon! 👋
            </h2>
            <p className="text-16 text-gray-600 mb-6">
              Comece conectando sua primeira conta bancária para gerenciar suas finanças de forma inteligente.
            </p>
          
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Conecte suas contas</h4>
                    <p className="text-sm text-gray-600">Link seguro com suas instituições bancárias</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-left">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Visualize suas finanças</h4>
                    <p className="text-sm text-gray-600">Acompanhe saldos e transações em tempo real</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-left">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Transfira dinheiro</h4>
                    <p className="text-sm text-gray-600">Envie e receba dinheiro facilmente</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <PluggyLink user={user} variant="primary" />
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  🔒 Suas informações bancárias são protegidas com criptografia de nível bancário
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyBankState
