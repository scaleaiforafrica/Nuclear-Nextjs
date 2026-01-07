'use client';

import { User, Building, Bell, Shield, CreditCard, Users } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <h2 className="text-xl sm:text-2xl mb-6">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'organization', label: 'Organization', icon: Building },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'team', label: 'Team', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl mb-4">Profile Settings</h3>
                <p className="text-sm sm:text-base text-gray-600">Manage your personal information and preferences</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl">
                  SJ
                </div>
                <div className="text-center sm:text-left">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mb-2 text-sm">
                    Change Photo
                  </button>
                  <p className="text-xs sm:text-sm text-gray-500">JPG, PNG or GIF (max. 5MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">First Name</label>
                  <input 
                    type="text"
                    defaultValue="Sarah"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Last Name</label>
                  <input 
                    type="text"
                    defaultValue="Johnson"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Email</label>
                <input 
                  type="email"
                  defaultValue="sarah.johnson@cityhospital.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Role</label>
                <input 
                  type="text"
                  defaultValue="Hospital Administrator"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div className="pt-4">
                <button className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  Save Changes
                </button>
              </div>
            </div>
          )}


          {activeTab === 'organization' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl mb-4">Organization Settings</h3>
                <p className="text-sm sm:text-base text-gray-600">Manage your organization details and preferences</p>
              </div>

              <div>
                <label className="block text-sm mb-2">Organization Name</label>
                <input 
                  type="text"
                  defaultValue="City Hospital Medical Center"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Primary Address</label>
                <input 
                  type="text"
                  defaultValue="123 Medical Avenue, Cape Town, South Africa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    defaultValue="+27 21 123 4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">License Number</label>
                  <input 
                    type="text"
                    defaultValue="ZA-MED-2024-1847"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  Update Organization
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl mb-4">Notification Preferences</h3>
                <p className="text-sm sm:text-base text-gray-600">Control how you receive notifications</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Shipment Updates', desc: 'Notifications about shipment status changes' },
                  { label: 'Compliance Alerts', desc: 'Alerts for expiring documents and compliance issues' },
                  { label: 'Temperature Warnings', desc: 'Critical temperature deviation alerts' },
                  { label: 'Delivery Confirmations', desc: 'Confirmation when shipments are delivered' },
                  { label: 'Quote Notifications', desc: 'New quotes received for procurement requests' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{item.label}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl mb-4">Security Settings</h3>
                <p className="text-sm sm:text-base text-gray-600">Manage your account security and authentication</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Two-Factor Authentication Enabled</div>
                  <div className="text-sm text-green-700">Your account is protected with 2FA</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Change Password</h4>
                <div className="space-y-3">
                  <input 
                    type="password"
                    placeholder="Current password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <input 
                    type="password"
                    placeholder="New password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <input 
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl mb-4">Billing & Subscription</h3>
                <p className="text-sm sm:text-base text-gray-600">Manage your subscription and payment methods</p>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 sm:p-6">
                <div className="text-xs sm:text-sm mb-2">Current Plan</div>
                <div className="text-2xl sm:text-3xl mb-4">Enterprise</div>
                <div className="text-xs sm:text-sm text-purple-100">Unlimited shipments • Advanced compliance • Priority support</div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Payment Method</h4>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-gray-600" />
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-gray-600">Expires 12/26</div>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700">Edit</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl mb-1">Team Members</h3>
                  <p className="text-sm sm:text-base text-gray-600">Manage your team and permissions</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm self-start">
                  Invite Member
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Sarah Johnson', email: 'sarah.johnson@cityhospital.com', role: 'Admin', status: 'Active' },
                  { name: 'Michael Chen', email: 'michael.chen@cityhospital.com', role: 'Manager', status: 'Active' },
                  { name: 'Emily Rodriguez', email: 'emily.r@cityhospital.com', role: 'User', status: 'Active' },
                  { name: 'David Kim', email: 'david.kim@cityhospital.com', role: 'User', status: 'Pending' },
                ].map((member, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm sm:text-base">{member.name}</div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                        <option>{member.role}</option>
                        <option>Admin</option>
                        <option>Manager</option>
                        <option>User</option>
                      </select>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
