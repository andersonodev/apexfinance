'use client';

import React from 'react'
import { Button } from './ui/button'
import PlaidLink from './PlaidLink'
import { useRouter } from 'next/navigation'

interface BankConnectionOptionsProps {
  user: User
}

const BankConnectionOptions = ({ user }: BankConnectionOptionsProps) => {
  const router = useRouter()

  const handleSkip = () => {
    // Redirecionar para a página principal sem conectar banco
    router.push('/')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-4">
        <h2 className="text-24 lg:text-36 font-semibold text-gray-900 mb-2">
          🎉 Conta criada com sucesso!
        </h2>
        <p className="text-16 font-normal text-gray-600">
          Agora conecte sua conta bancária para começar a gerenciar suas finanças ou explore a plataforma primeiro.
        </p>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Botão principal para conectar banco */}
        <PlaidLink user={user} variant="primary" />
        
        {/* Botão secundário para pular */}
        <Button 
          onClick={handleSkip}
          variant="outline"
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Continuar sem conectar banco
        </Button>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-14 text-gray-500">
          Você pode conectar sua conta bancária a qualquer momento nas configurações.
        </p>
      </div>
    </div>
  )
}

export default BankConnectionOptions
