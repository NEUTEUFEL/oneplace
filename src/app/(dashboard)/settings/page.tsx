'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { User, Lock, Bell, Database, Save } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your account and preferences</p>
      </div>

      <div className="card">
        <div className="border-b border-[var(--border)]">
          <div className="flex">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'data', label: 'Data', icon: Database },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  defaultValue={session?.user?.name || ''}
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  defaultValue={session?.user?.email || ''}
                  className="input"
                  disabled
                />
                <p className="text-sm text-[var(--text-secondary)] mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="input-label">Role</label>
                <input
                  type="text"
                  value={session?.user?.role || 'user'}
                  className="input capitalize"
                  disabled
                />
              </div>
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="input-label">Current Password</label>
                <input type="password" className="input" />
              </div>
              <div>
                <label className="input-label">New Password</label>
                <input type="password" className="input" />
              </div>
              <div>
                <label className="input-label">Confirm New Password</label>
                <input type="password" className="input" />
              </div>
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="w-4 h-4" />
                Update Password
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-4">
                {[
                  { id: 'email_new_lead', label: 'New lead notifications', description: 'Get notified when a new lead is created' },
                  { id: 'email_task', label: 'Task assignments', description: 'Get notified when a task is assigned to you' },
                  { id: 'email_payment', label: 'Payment reminders', description: 'Get reminded about upcoming and overdue payments' },
                  { id: 'email_weekly', label: 'Weekly digest', description: 'Receive a weekly summary of your activity' },
                ].map(item => (
                  <div key={item.id} className="flex items-start justify-between p-4 rounded-lg border border-[var(--border)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                    </label>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6 max-w-xl">
              <div className="p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-medium text-[var(--text-primary)] mb-2">Export Data</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Download all your data including leads, projects, and financial records.
                </p>
                <button className="btn btn-secondary">
                  Export All Data
                </button>
              </div>
              <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="btn btn-danger">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
