import React, { useState } from 'react'
import { AlertTriangle, Upload, Calendar, MapPin, FileText, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

const ReportForm = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    category: 'fraud',
    title: '',
    description: '',
    location: '',
    incidentDate: '',
    lookupEntities: [],
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [error, setError] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [entityInput, setEntityInput] = useState({ type: 'email', value: '' })

  const categories = [
    { value: 'fraud', label: 'Financial Fraud' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'harassment', label: 'Online Harassment' },
    { value: 'deepfake', label: 'Deepfake' },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addLookupEntity = () => {
    if (entityInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        lookupEntities: [...prev.lookupEntities, { ...entityInput, value: entityInput.value.trim() }],
      }))
      setEntityInput({ type: 'email', value: '' })
    }
  }

  const removeLookupEntity = (index) => {
    setFormData(prev => ({
      ...prev,
      lookupEntities: prev.lookupEntities.filter((_, i) => i !== index),
    }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const uploadFile = async (reportId) => {
    if (!file) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${reportId}.${fileExt}`
    const filePath = `evidence/${fileName}`

    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(filePath, file)

    if (error) {
      console.error('File upload error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let userId = user?.id || null

      // Anonymous report: proceed with null user_id (no user record created)
      if (!user && isAnonymous) {
        userId = null
      } else if (!user && !isAnonymous) {
        throw new Error('Please sign in or choose anonymous reporting')
      }

      // Create the report
      const reportData = {
        user_id: userId,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        incident_date: formData.incidentDate || null,
      }

      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single()

      if (reportError) throw reportError

      let fileUrl = null

      // Upload file if provided
      if (file) {
        fileUrl = await uploadFile(report.id)
        if (fileUrl) {
          await supabase
            .from('reports')
            .update({ file_url: fileUrl })
            .eq('id', report.id)
        }
      }

      // Handle deepfake specific data
      if (formData.category === 'deepfake' && file) {
        const deepfakeData = {
          report_id: report.id,
          file_url: fileUrl || '',
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          metadata: {
            uploadDate: new Date().toISOString(),
            originalName: file.name,
          },
        }

        await supabase.from('deepfakes').insert(deepfakeData)
      }

      // Insert lookup entities
      if (formData.lookupEntities.length > 0) {
        const lookupData = formData.lookupEntities.map(entity => ({
          report_id: report.id,
          entity_type: entity.type,
          entity_value: entity.value,
        }))

        await supabase.from('fraud_lookups').insert(lookupData)
      }

      setReferenceId(report.reference_id)
      setSuccess(true)
    } catch (error) {
      setError(error.message || 'An error occurred while submitting the report')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted Successfully</h2>
          <p className="text-gray-600 mb-6">
            Your report has been received. Please save your reference ID for future reference.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-600 font-medium">Reference ID</p>
            <p className="text-xl font-mono text-blue-800">{referenceId}</p>
          </div>
          <button
            onClick={() => {
              setSuccess(false)
              setFormData({
                category: 'fraud',
                title: '',
                description: '',
                location: '',
                incidentDate: '',
                lookupEntities: [],
              })
              setFile(null)
              setReferenceId('')
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Report Cybercrime
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Help protect others by reporting suspicious activities and cyber threats
          </p>
        </div>

        {success ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Report Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Thank you for helping to protect the community. Your report has been received and will be reviewed.
            </p>
            {referenceId && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Reference ID:</p>
                <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">{referenceId}</p>
              </div>
            )}
            <button
              onClick={() => {
                setSuccess(false)
                setFormData({
                  category: 'fraud',
                  title: '',
                  description: '',
                  location: '',
                  incidentDate: '',
                  lookupEntities: [],
                })
                setFile(null)
                setReferenceId('')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymous Report Option */}
              {!user && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Submit anonymously (no account required)
                  </label>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of the incident"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Provide detailed information about the incident..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Where did this incident occur?"
                  />
                  <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Incident Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Incident Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Lookup Entities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Related Entities (emails, phone numbers, websites)
                </label>
                <div className="space-y-2">
                  {formData.lookupEntities.map((entity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{entity.type}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{entity.value}</span>
                      <button
                        type="button"
                        onClick={() => removeLookupEntity(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <select
                      value={entityInput.type}
                      onChange={(e) => setEntityInput({ ...entityInput, type: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="website">Website</option>
                    </select>
                    <input
                      type="text"
                      value={entityInput.value}
                      onChange={(e) => setEntityInput({ ...entityInput, value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter entity value"
                    />
                    <button
                      type="button"
                      onClick={addLookupEntity}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Evidence (optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload screenshots, documents, or other evidence (max 10MB)
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Choose File
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportForm
