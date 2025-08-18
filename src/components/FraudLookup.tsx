import React, { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type FraudLookup = Database['public']['Tables']['fraud_lookups']['Row'] & {
  reports: Database['public']['Tables']['reports']['Row']
}

const FraudLookup: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'website'>('email')
  const [results, setResults] = useState<FraudLookup[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const { data, error } = await supabase
        .from('fraud_lookups')
        .select(`
          *,
          reports (
            id,
            title,
            category,
            created_at,
            reference_id,
            location
          )
        `)
        .eq('entity_type', searchType)
        .ilike('entity_value', `%${searchQuery.trim()}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      setResults(data || [])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'email':
        return 'Enter email address (e.g., suspicious@example.com)'
      case 'phone':
        return 'Enter phone number (e.g., +1234567890)'
      case 'website':
        return 'Enter website URL (e.g., scam-site.com)'
    }
  }

  const categoryColors = {
    fraud: 'bg-red-100 text-red-800',
    phishing: 'bg-orange-100 text-orange-800',
    harassment: 'bg-purple-100 text-purple-800',
    deepfake: 'bg-pink-100 text-pink-800',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fraud Lookup Tool</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check if an email, phone number, or website has been previously reported for cybercrime
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to search for?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'email', label: 'Email Address', icon: '📧' },
                  { value: 'phone', label: 'Phone Number', icon: '📱' },
                  { value: 'website', label: 'Website URL', icon: '🌐' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      searchType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="searchType"
                      value={option.value}
                      checked={searchType === option.value}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Query
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getSearchPlaceholder()}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Search className="h-5 w-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Searching...' : 'Search Database'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching our database...</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                <div className="flex items-center mb-6">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <h2 className="text-xl font-semibold text-red-600">
                    ⚠️ Found {results.length} report(s) for "{searchQuery}"
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="border border-red-200 rounded-lg p-6 bg-red-50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.reports?.title}
                          </h3>
                          <div className="flex items-center space-x-3 mt-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                categoryColors[result.reports?.category as keyof typeof categoryColors]
                              }`}
                            >
                              {result.reports?.category?.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              Reported: {formatDate(result.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Reference ID</p>
                          <p className="font-mono text-sm">{result.reports?.reference_id}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded p-4 border border-red-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Reported Entity:</p>
                        <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                          {result.entity_value}
                        </p>
                      </div>

                      {result.reports?.location && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            📍 Location: {result.reports.location}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Security Recommendation</h3>
                  <p className="text-sm text-yellow-700">
                    This {searchType} has been reported for cybercrime activities. Exercise extreme caution 
                    and avoid sharing personal information, making payments, or clicking on links from this source.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-green-600 mb-2">
                  ✅ No Reports Found
                </h2>
                <p className="text-gray-600 mb-4">
                  "{searchQuery}" has not been reported in our database.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    While this {searchType} hasn't been reported yet, always remain vigilant and trust your instincts. 
                    If something seems suspicious, it's better to be cautious.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 How to Use This Tool</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• <strong>Email:</strong> Search for suspicious email addresses used in scams</p>
            <p>• <strong>Phone:</strong> Check if a phone number has been used for fraud calls</p>
            <p>• <strong>Website:</strong> Verify if a website has been reported as fraudulent</p>
            <p className="mt-3 font-medium">
              Remember: This tool shows reported incidents. A "clean" result doesn't guarantee safety - always use your best judgment!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FraudLookup