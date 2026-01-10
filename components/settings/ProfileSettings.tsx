'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { User, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { ProfileUpdateData } from '@/models'

interface ProfileSettingsProps {
  profile: any
  onUpdate: (data: ProfileUpdateData) => Promise<void>
  isLoading: boolean
}

export function ProfileSettings({ profile, onUpdate, isLoading }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    job_title: profile?.job_title || '',
    department: profile?.department || '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || '')
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
          <Input
            id="role"
            type="text"
            value={profile?.role || 'User'}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            Role is assigned by your administrator
          </p>
        </div>
      </div>
    </div>
  )
}
