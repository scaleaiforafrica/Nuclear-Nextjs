'use client'

import { useState } from 'react'
import { Check, ChevronDown, Plus, LogOut as LogOutIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/models'
import type { StoredAccount } from '@/lib/account-manager'

interface AccountSwitcherProps {
  currentUser: User
  accounts: StoredAccount[]
  onAccountSwitch: (accountId: string) => void
  onAddAccount: () => void
  onRemoveAccount: (accountId: string) => void
  collapsed?: boolean
}

export function AccountSwitcher({
  currentUser,
  accounts,
  onAccountSwitch,
  onAddAccount,
  onRemoveAccount,
  collapsed = false,
}: AccountSwitcherProps) {
  const [open, setOpen] = useState(false)

  const handleAccountSelect = (accountId: string) => {
    onAccountSwitch(accountId)
    setOpen(false)
  }

  const handleAddAccount = () => {
    onAddAccount()
    setOpen(false)
  }

  if (collapsed) {
    const collapsedButtonClasses = [
      'w-full flex items-center justify-center',
      'p-2 hover:bg-gray-50 active:bg-gray-100',
      'rounded-lg transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    ].join(' ')

    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={collapsedButtonClasses}
            aria-label="Switch account"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              {currentUser.initials}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Accounts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts.map((account) => {
            const isActive = account.id === currentUser.id
            return (
              <DropdownMenuItem
                key={account.id}
                onClick={() => handleAccountSelect(account.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    {account.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{account.name}</div>
                    <div className="text-xs text-gray-500 truncate">{account.email}</div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleAddAccount}
            className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const expandedButtonClasses = [
    'w-full flex items-center gap-3',
    'p-3 hover:bg-gray-50 active:bg-gray-100',
    'rounded-lg transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'group'
  ].join(' ')

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={expandedButtonClasses}
          aria-label="Switch account"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            {currentUser.initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium truncate">{currentUser.name}</div>
            <div className="text-xs text-gray-500 truncate">
              {accounts.find(a => a.id === currentUser.id)?.email || 'Account'}
            </div>
          </div>
          <ChevronDown
            className="w-4 h-4 text-gray-400 transition-transform group-hover:text-gray-600"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Accounts ({accounts.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.map((account) => {
          const isActive = account.id === currentUser.id
          return (
            <DropdownMenuItem
              key={account.id}
              onClick={() => handleAccountSelect(account.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                  {account.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{account.name}</div>
                  <div className="text-xs text-gray-500 truncate">{account.email}</div>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleAddAccount}
          className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Add Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
