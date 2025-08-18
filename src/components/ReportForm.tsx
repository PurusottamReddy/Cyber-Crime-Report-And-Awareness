import React, { useState } from 'react'
import { AlertTriangle, Upload, Calendar, MapPin, FileText, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface FormData {
  category: 'fraud' | 'phishing' | 'harassment' | 'deepfake'
  title: string
  description: string
  location: string
  incidentDate: string
  lookupEntities: Array<{ type: 'email' | 'phone' | 'website'; value: string }>
}

const ReportForm: React.FC = () => {
  const { user, createAnonymousUser } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    category: 'fraud',
    title: '',
    description: '',
    location: '',
    incidentDate: '',
    lookupEntities: [],
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [error, setError] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [entityInput, setEntityInput] = useState({ type: 'email' as const, value: '' })

  const categories = [
    { value: 'fraud', label: 'Financial Fraud' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'harassment', label: 'Online Harassment' },
    { value: 'deepfake', label: 'Deepfake' },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const removeLookupEntity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lookupEntities: prev.lookupEntities.filter((_, i) => i !== index),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const uploadFile = async (reportId: string): Promise<string | null> => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let userId = user?.id || null

      // Create anonymous user if needed
      if (!user && isAnonymous) {
        userId = await createAnonymousUser()
        if (!userId) {
          throw new Error('Failed to create anonymous user')
        }
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

      let fileUrl: string | null = null

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
    } catch (error: any) {
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-8">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Cybercrime</h1>
              <p className="text-gray-600 mt-1">Help protect the community by reporting suspicious activities</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Option */}
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-yellow-800">
                    Report anonymously (you won't be able to track your report)
                  </span>
                </label>
              </div>
            )}

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the incident"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of what happened..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, State, Country"
                />
              </div>

              {/* Incident Date */}
              <div>
                <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Incident Date
                </label>
                <input
                  type="date"
                  id="incidentDate"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fraud Lookup Entities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Emails/Phones/Websites
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Add any emails, phone numbers, or websites involved in this incident
              </p>
              <div className="flex gap-2 mb-2">
                <select
                  value={entityInput.type}
                  onChange={(e) => setEntityInput(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="website">Website</option>
                </select>
                <input
                  type="text"
                  value={entityInput.value}
                  onChange={(e) => setEntityInput(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter value..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addLookupEntity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.lookupEntities.length > 0 && (
                <div className="space-y-1">
                  {formData.lookupEntities.map((entity, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        <span className="font-medium capitalize">{entity.type}:</span> {entity.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLookupEntity(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Upload className="h-4 w-4 inline mr-1" />
                Evidence File
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Upload images, documents, or videos as evidence (max 10MB)
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {file && (
                <p className="text-sm text-green-600 mt-1">
                  File selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || (!user && !isAnonymous)}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <FileText className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Submitting Report...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReportForm