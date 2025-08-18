import React, { useState, useEffect } from 'react'
import { Shield, Clock, MapPin, AlertTriangle, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Report = Database['public']['Tables']['reports']['Row']

const ScamWall: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const categoryColors = {
    fraud: 'bg-red-100 text-red-800 border-red-200',
    phishing: 'bg-orange-100 text-orange-800 border-orange-200',
    harassment: 'bg-purple-100 text-purple-800 border-purple-200',
    deepfake: 'bg-pink-100 text-pink-800 border-pink-200',
  }

  const categoryIcons = {
    fraud: '💰',
    phishing: '🎣',
    harassment: '😠',
    deepfake: '🤖',
  }

  useEffect(() => {
    fetchReports()
    setupRealtimeSubscription()
  }, [filter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter !== 'all') {
        query = query.eq('category', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          const newReport = payload.new as Report
          if (filter === 'all' || newReport.category === filter) {
            setReports(prev => [newReport, ...prev.slice(0, 49)])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading latest reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Scam Wall</h1>
              <p className="text-gray-600 mt-1">Real-time feed of reported cybercrimes</p>
            </div>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Updates</span>
            </div>
            <div className="text-sm text-gray-500">
              Showing {reports.length} reports
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Reports' },
                { key: 'fraud', label: 'Fraud' },
                { key: 'phishing', label: 'Phishing' },
                { key: 'harassment', label: 'Harassment' },
                { key: 'deepfake', label: 'Deepfake' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reports found for the selected category.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{categoryIcons[report.category]}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        categoryColors[report.category]
                      }`}
                    >
                      {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {report.reference_id}
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {report.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {truncateText(report.description)}
                </p>

                {/* Metadata */}
                <div className="space-y-2 text-sm text-gray-500">
                  {report.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {report.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(report.created_at)}
                  </div>
                  {report.incident_date && (
                    <div className="flex items-center text-xs">
                      <span className="mr-1">Incident:</span>
                      {new Date(report.incident_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* File Indicator */}
                {report.file_url && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-blue-600">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Evidence file attached
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Status: {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScamWall