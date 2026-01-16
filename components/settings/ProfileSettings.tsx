'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { User, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProfileUpdateData } from '@/models'
import type { UserRole } from '@/models/user.model'

interface ProfileSettingsProps {
  profile: {
    name?: string
    phone?: string
    job_title?: string
    department?: string
    role?: string
    email?: string
    avatar_url?: string
  } | null
  onUpdate: (data: ProfileUpdateData) => Promise<void>
  isLoading: boolean
}

const USER_ROLES: UserRole[] = [
  'Hospital Administrator',
  'Logistics Manager',
  'Compliance Officer'
]

export function ProfileSettings({ profile, onUpdate, isLoading }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    job_title: profile?.job_title || '',
    department: profile?.department || '',
    role: profile?.role || '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || '')
  const [hasPhotoChanged, setHasPhotoChanged] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Preview the image
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        setHasPhotoChanged(true)
      }
      reader.readAsDataURL(file)
      
      // TODO: Upload to storage and get URL
      // For now, we'll use the preview URL
    }
  }

  const handleSubmit = async () => {
    await onUpdate({
      ...formData,
      avatar_url: avatarPreview
    })
  }

  const getInitials = () => {
    if (!formData.name) return 'U'
    return formData.name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Profile Settings</h3>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold">
              {getInitials()}
            </div>
          )}
        </div>
        {!hasPhotoChanged && (
          <div className="text-center sm:text-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mb-2"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            <p className="text-xs sm:text-sm text-gray-500">
              JPG, PNG or GIF (max. 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title</Label>
          <Input
            id="job_title"
            name="job_title"
            type="text"
            value={formData.job_title}
            onChange={handleInputChange}
            placeholder="e.g., Safety Manager"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleInputChange}
            placeholder="e.g., Operations"
          />
        </div>
      </div>

      {/* Read-only fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || 'Not available'}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            Email address cannot be changed from here
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
