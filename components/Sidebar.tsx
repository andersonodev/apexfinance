'use client';

import React, { useEffect, useState } from 'react'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Footer from './Footer'
import PluggyLink from './PluggyLink'
import { getBanks } from '@/lib/actions/user.actions'

const Sidebar = ({ user }: SiderbarProps) => {
  const pathname = usePathname();
  const [hasBanks, setHasBanks] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBanks = async () => {
      try {
        const banks = await getBanks({ userId: user.$id });
        setHasBanks(banks && banks.length > 0);
      } catch (error) {
        console.error('Error checking banks:', error);
        setHasBanks(false);
      }
    };

    if (user?.$id) {
      checkBanks();
    }
  }, [user?.$id]);

  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <Image 
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon logo"
            className="size-[24px] max-xl:size-14"
          />
          <h1 className="sidebar-logo">Horizon</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

          // Se não tem bancos e a rota precisa de bancos, desabilita o link
          const requiresBanks = ['my-banks', 'transaction-history', 'payment-transfer'].some(route => 
            item.route.includes(route)
          );
          const isDisabled = requiresBanks && hasBanks === false;

          if (isDisabled) {
            return (
              <div 
                key={item.label}
                className="sidebar-link opacity-50 cursor-not-allowed"
                title="Conecte uma conta bancária para acessar esta funcionalidade"
              >
                <div className="relative size-6">
                  <Image 
                    src={item.imgURL}
                    alt={item.label}
                    fill
                  />
                </div>
                <p className="sidebar-label text-gray-400">
                  {item.label}
                </p>
              </div>
            )
          }

          return (
            <Link href={item.route} key={item.label}
              className={cn('sidebar-link', { 'bg-bank-gradient': isActive })}
            >
              <div className="relative size-6">
                <Image 
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({
                    'brightness-[3] invert-0': isActive
                  })}
                />
              </div>
              <p className={cn("sidebar-label", { "!text-white": isActive })}>
                {item.label}
              </p>
            </Link>
          )
        })}
        
        {/* Condicionalmente mostra o PluggyLink */}
        {hasBanks === false && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-2 font-medium">
              Conecte sua primeira conta
            </p>
            <PluggyLink user={user} variant="ghost" />
            <p className="text-xs text-blue-500 mt-1">
              Para acessar todas as funcionalidades
            </p>
          </div>
        )}
        
        {hasBanks === true && (
          <PluggyLink user={user} />
        )}
      </nav>

      <Footer user={user} />
    </section>
  )
}

export default Sidebar