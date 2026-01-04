'use client'

import { useState } from 'react'
import { Mail, Calendar, Link2, RefreshCw, Settings, CheckCircle, AlertCircle } from 'lucide-react'

export default function OutlookPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    // TODO: Implement Microsoft OAuth flow
    // This would redirect to Microsoft's auth endpoint
    setTimeout(() => {
      setConnecting(false)
      alert('Outlook integration requires Microsoft Azure App registration. Please configure your MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_TENANT_ID in your environment variables.')
    }, 1000)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Outlook Integration</h1>
        <p className="text-[var(--text-secondary)]">Connect your Outlook account to sync emails and calendar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-100">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Microsoft Outlook</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {isConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {isConnected ? (
                <CheckCircle className="w-6 h-6 text-[var(--success)] ml-auto" />
              ) : (
                <AlertCircle className="w-6 h-6 text-[var(--text-disabled)] ml-auto" />
              )}
            </div>

            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="btn btn-primary w-full"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Connect Outlook Account
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <button className="btn btn-secondary w-full">
                  <RefreshCw className="w-4 h-4" />
                  Sync Now
                </button>
                <button className="btn btn-danger w-full">
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Integration Features</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background)]">
              <Mail className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Email Sync</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Automatically import email conversations with leads and contacts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background)]">
              <Calendar className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Calendar Integration</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Sync meetings and appointments with your leads
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background)]">
              <Settings className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Auto-logging</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Automatically log all communications in lead timeline
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Setup Instructions</h2>
          </div>
          <div className="p-4">
            <ol className="list-decimal list-inside space-y-3 text-[var(--text-secondary)]">
              <li>
                <span className="text-[var(--text-primary)]">Create an Azure App Registration</span>
                <p className="ml-6 mt-1 text-sm">
                  Go to Azure Portal &gt; Azure Active Directory &gt; App registrations &gt; New registration
                </p>
              </li>
              <li>
                <span className="text-[var(--text-primary)]">Configure API Permissions</span>
                <p className="ml-6 mt-1 text-sm">
                  Add Microsoft Graph permissions: Mail.Read, Calendars.Read, Contacts.Read
                </p>
              </li>
              <li>
                <span className="text-[var(--text-primary)]">Create Client Secret</span>
                <p className="ml-6 mt-1 text-sm">
                  Go to Certificates & secrets &gt; New client secret
                </p>
              </li>
              <li>
                <span className="text-[var(--text-primary)]">Update Environment Variables</span>
                <p className="ml-6 mt-1 text-sm">
                  Add MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_TENANT_ID to your .env file
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
