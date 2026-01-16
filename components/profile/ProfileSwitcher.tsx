'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserRole } from '@/models'

interface Profile {
  name: string
  role: UserRole
  initials: string
}

interface ProfileSwitcherProps {
  currentProfile: Profile
  availableProfiles: Profile[]
  onProfileSwitch: (profile: Profile) => void
  collapsed?: boolean
}

export function ProfileSwitcher({
  currentProfile,
  availableProfiles,
  onProfileSwitch,
  collapsed = false,
}: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false)

  const handleProfileSelect = (profile: Profile) => {
    if (profile.role !== currentProfile.role) {
      onProfileSwitch(profile)
    }
    setOpen(false)
  }

  if (collapsed) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="w-full flex items-center justify-center p-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Switch profile"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              {currentProfile.initials}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableProfiles.map((profile) => (
            <DropdownMenuItem
              key={profile.role}
              onClick={() => handleProfileSelect(profile)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                  {profile.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{profile.name}</div>
                  <div className="text-xs text-gray-500 truncate">{profile.role}</div>
                </div>
                {profile.role === currentProfile.role && (
                  <Check className="w-4 h-4 text-purple-600" aria-hidden="true" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          aria-label="Switch profile"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            {currentProfile.initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium truncate">{currentProfile.name}</div>
            <div className="text-xs text-gray-500 truncate">{currentProfile.role}</div>
          </div>
          <ChevronDown
            className="w-4 h-4 text-gray-400 transition-transform group-hover:text-gray-600"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableProfiles.map((profile) => (
          <DropdownMenuItem
            key={profile.role}
            onClick={() => handleProfileSelect(profile)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                {profile.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{profile.name}</div>
                <div className="text-xs text-gray-500 truncate">{profile.role}</div>
              </div>
              {profile.role === currentProfile.role && (
                <Check className="w-4 h-4 text-purple-600" aria-hidden="true" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
