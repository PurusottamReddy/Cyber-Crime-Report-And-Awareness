import React, { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

const FraudLookup = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('email')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
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

  const formatDate = (dateString) => {
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
    fraud: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
    phishing: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400',
    harassment: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
    deepfake: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Search className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fraud Lookup Tool</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Check if an email, phone number, or website has been previously reported for cybercrime
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      searchType === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="searchType"
                      value={option.value}
                      checked={searchType === option.value}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{option.icon}</span>
                            <span className={`font-medium ${
                              searchType === option.value
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {option.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      {searchType === option.value && (
                        <div className="shrink-0 text-blue-600 dark:text-blue-400">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Query
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getSearchPlaceholder()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Database'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Search Results
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Searching database...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This {searchType} has not been reported in our database.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                      Found {results.length} report{results.length > 1 ? 's' : ''} for this {searchType}
                    </span>
                  </div>
                </div>

                {results.map((result) => (
                  <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {result.reports?.title || 'Report Details'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          <span className="font-medium">Entity:</span> {result.entity_value}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[result.reports?.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        {result.reports?.category || 'Unknown'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <p><span className="font-medium">Reported:</span> {formatDate(result.created_at)}</p>
                      {result.reports?.location && (
                        <p><span className="font-medium">Location:</span> {result.reports.location}</p>
                      )}
                      {result.reports?.reference_id && (
                        <p><span className="font-medium">Reference ID:</span> {result.reports.reference_id}</p>
                      )}
                    </div>
                  </div>
                ))}
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
