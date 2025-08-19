import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Edit, Trash2, Eye, FileText, AlertTriangle, Shield, Search, BookOpen, Save, X, Plus, Edit2 } from 'lucide-react'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [articles, setArticles] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'view', 'edit', 'delete'
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    organization: user?.user_metadata?.organization || ''
  })

  // Fetch user's reports and articles
  useEffect(() => {
    if (user) {
      fetchUserData()
      testDatabaseConnection()
    }
  }, [user])

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...')
      
      // Test if we can query the reports table
      const { data: testReports, error: testError } = await supabase
        .from('reports')
        .select('count')
        .limit(1)
      
      console.log('Database connection test:', { data: testReports, error: testError })
      
      // Test if we can query the articles table
      const { data: testArticles, error: testArticlesError } = await supabase
        .from('articles')
        .select('count')
        .limit(1)
      
      console.log('Articles table test:', { data: testArticles, error: testArticlesError })

      // Test user's own reports
      if (user) {
        const { data: userReports, error: userReportsError } = await supabase
          .from('reports')
          .select('id, title, user_id')
          .eq('user_id', user.id)
          .limit(1)
        
        console.log('User reports test:', { data: userReports, error: userReportsError })

        // Test user's own articles
        const { data: userArticles, error: userArticlesError } = await supabase
          .from('articles')
          .select('id, title, user_id')
          .eq('user_id', user.id)
          .limit(1)
        
        console.log('User articles test:', { data: userArticles, error: userArticlesError })

        // Test update permission on a sample report
        if (userReports && userReports.length > 0) {
          const testReport = userReports[0]
          console.log('Testing update permission on report:', testReport.id)
          
          const { data: updateTest, error: updateError } = await supabase
            .from('reports')
            .update({ title: testReport.title }) // Update with same title
            .eq('id', testReport.id)
            .select()
          
          console.log('Update permission test:', { data: updateTest, error: updateError })
        }
      }
      
    } catch (error) {
      console.error('Database connection test failed:', error)
    }
  }

  const testPermissions = async () => {
    try {
      console.log('=== TESTING PERMISSIONS ===')
      
      if (!user) {
        console.log('No user logged in')
        return
      }

      // Test if we can read our own reports
      const { data: readTest, error: readError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      console.log('Read permission test:', { data: readTest, error: readError })

      if (readTest && readTest.length > 0) {
        const testReport = readTest[0]
        
        // Test update permission
        const { data: updateTest, error: updateError } = await supabase
          .from('reports')
          .update({ title: testReport.title })
          .eq('id', testReport.id)
          .select()

        console.log('Update permission test:', { data: updateTest, error: updateError })

        // Test delete permission (but don't actually delete)
        console.log('Delete permission would be tested on report:', testReport.id)
      }

      console.log('=== END PERMISSIONS TEST ===')
    } catch (error) {
      console.error('Permission test failed:', error)
    }
  }

  const testDelete = async () => {
    try {
      console.log('=== TESTING DELETE OPERATION ===')
      
      if (!user || reports.length === 0) {
        console.log('No user or no reports to test with')
        return
      }

      const testReport = reports[0]
      console.log('Testing delete on report:', testReport)
      
      // Test delete without actually deleting
      console.log('Would delete report with ID:', testReport.id)
      console.log('Report user_id:', testReport.user_id)
      console.log('Current user_id:', user.id)
      
      // Check if user owns this report
      if (testReport.user_id !== user.id) {
        console.log('ERROR: User does not own this report!')
        return
      }
      
      console.log('User owns this report, delete should work')
      console.log('=== END DELETE TEST ===')
    } catch (error) {
      console.error('Delete test failed:', error)
    }
  }

  const testUpdate = async () => {
    try {
      console.log('=== TESTING UPDATE OPERATION ===')
      
      if (!user || reports.length === 0) {
        console.log('No user or no reports to test with')
        return
      }

      const testReport = reports[0]
      console.log('Testing update on report:', testReport)
      
      // Test update by changing status instead of title (less intrusive)
      const newStatus = testReport.status === 'pending' ? 'investigating' : 'pending'
      const testUpdate = { 
        title: testReport.title,
        description: testReport.description,
        category: testReport.category,
        status: newStatus
      }
      console.log('Test update data:', testUpdate)
      
      const { data, error } = await supabase
        .from('reports')
        .update(testUpdate)
        .eq('id', testReport.id)
        .select()

      console.log('Test update result:', { data, error })
      
      if (error) {
        console.error('Test update failed:', error)
      } else {
        console.log('Test update successful! Status changed to:', newStatus)
        // Refresh data to see the change
        await fetchUserData()
      }
      
      console.log('=== END UPDATE TEST ===')
    } catch (error) {
      console.error('Update test failed:', error)
    }
  }

  const cleanupTestData = async () => {
    try {
      console.log('=== CLEANING UP TEST DATA ===')
      
      if (!user || reports.length === 0) {
        console.log('No reports to clean up')
        return
      }

      // Find reports with "(test)" in the title
      const reportsToClean = reports.filter(report => report.title.includes('(test)'))
      
      if (reportsToClean.length === 0) {
        console.log('No test data found to clean up')
        return
      }

      console.log('Found', reportsToClean.length, 'reports with test data to clean')

      for (const report of reportsToClean) {
        const cleanTitle = report.title.replace(/\(test\)/g, '').trim()
        
        const { data, error } = await supabase
          .from('reports')
          .update({ title: cleanTitle })
          .eq('id', report.id)
          .select()

        if (error) {
          console.error('Error cleaning up report', report.id, ':', error)
        } else {
          console.log('Cleaned up report:', report.id, '->', cleanTitle)
        }
      }

      // Refresh data
      await fetchUserData()
      console.log('=== END CLEANUP ===')
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  const fetchUserData = async () => {
    setLoading(true)
    try {
      console.log('Fetching data for user:', user.id)
      
      // Fetch user's reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('Reports query result:', { data: reportsData, error: reportsError })

      if (reportsError) throw reportsError

      // Fetch user's articles - use user_id, not author_id
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('Articles query result:', { data: articlesData, error: articlesError })

      if (articlesError) throw articlesError

      setReports(reportsData || [])
      setArticles(articlesData || [])
      
      console.log('Final state:', { reports: reportsData || [], articles: articlesData || [] })
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      organization: user?.user_metadata?.organization || ''
    })
    setIsEditing(false)
  }

  // Report and Article Management Functions
  const handleView = (item, type) => {
    setSelectedItem(item)
    setModalType('view')
    setShowModal(true)
  }

  const handleEdit = (item, type) => {
    setSelectedItem(item)
    setModalType(`edit-${type}`) // Fix: Use 'edit-report' or 'edit-article' instead of just 'edit'
    setShowModal(true)
  }

  const handleDelete = async (item, type) => {
    try {
      console.log('=== DELETE OPERATION DEBUG ===')
      console.log('Item to delete:', item)
      console.log('Type:', type)
      console.log('User ID:', user?.id)
      
      const table = type === 'report' ? 'reports' : 'articles'
      console.log('Target Table:', table)
      
      // Log the exact query we're about to run
      console.log('Query:', `DELETE FROM ${table} WHERE id = ${item.id}`)
      
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id)
        .select()

      console.log(`Delete result for ${type}:`, { data, error })
      console.log('=== END DELETE DEBUG ===')

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      // Refresh data
      await fetchUserData()
      console.log(`${type} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
    }
  }

  const handleSaveItem = async (updatedData) => {
    try {
      console.log('=== UPDATE OPERATION DEBUG ===')
      console.log('Selected Item:', selectedItem)
      console.log('Updated Data:', updatedData)
      console.log('Modal Type:', modalType)
      console.log('User ID:', user?.id)
      console.log('Selected Item User ID:', selectedItem?.user_id)
      
      const table = modalType.includes('report') ? 'reports' : 'articles'
      console.log('Target Table:', table)
      
      // Check if user owns this item
      if (selectedItem.user_id !== user.id) {
        console.error('ERROR: User does not own this item!')
        console.error('Item user_id:', selectedItem.user_id)
        console.error('Current user_id:', user.id)
        return
      }
      
      // Filter the data based on table type
      let filteredData = {}
      if (table === 'reports') {
        // For reports, only include these fields
        filteredData = {
          title: updatedData.title,
          description: updatedData.description,
          category: updatedData.category,
          status: updatedData.status
        }
      } else {
        // For articles, include these fields
        filteredData = {
          title: updatedData.title,
          content: updatedData.content,
          published: updatedData.published
        }
      }
      
      console.log('Filtered data for', table, ':', filteredData)
      
      // Log the exact query we're about to run
      console.log('Query:', `UPDATE ${table} SET`, filteredData, `WHERE id = ${selectedItem.id}`)
      
      const { data, error } = await supabase
        .from(table)
        .update(filteredData)
        .eq('id', selectedItem.id)
        .select()

      console.log(`Update result for ${table}:`, { data, error })
      console.log('=== END UPDATE DEBUG ===')

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Update successful! Refreshing data...')
      await fetchUserData()
      setShowModal(false)
      setSelectedItem(null)
      console.log('Modal closed and data refreshed')
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'investigating':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'Published':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (item) => {
    // For reports, use the status field
    if (item.status) {
      return item.status.charAt(0).toUpperCase() + item.status.slice(1)
    }
    // For articles, use published field
    if (item.hasOwnProperty('published')) {
      return item.published ? 'Published' : 'Draft'
    }
    return 'Unknown'
  }

  const getTypeIcon = (category) => {
    switch (category) {
      case 'phishing':
        return <AlertTriangle className="h-4 w-4" />
      case 'fraud':
        return <Shield className="h-4 w-4" />
      case 'harassment':
        return <User className="h-4 w-4" />
      case 'deepfake':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your account, reports, and articles</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user?.user_metadata?.name || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</span>
                    <p className="text-gray-900 dark:text-white">{user?.user_metadata?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</span>
                    <p className="text-gray-900 dark:text-white">{user?.user_metadata?.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</span>
                    <p className="text-gray-900 dark:text-white">{user?.user_metadata?.organization || 'Not set'}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reports and Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'reports'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Reports ({reports.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'articles'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Articles ({articles.length})
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Loading...</p>
                  </div>
                ) : activeTab === 'reports' ? (
                  <div className="space-y-4">
                    {reports.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No reports yet.</p>
                      </div>
                    ) : (
                      reports.map((report) => (
                        <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="flex items-center space-x-2">
                                  {getTypeIcon(report.category)}
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{report.category}</span>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                  {getStatusText(report)}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{report.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{report.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                {report.location && <span>{report.location}</span>}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(report, 'report')}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(report, 'report')}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(report, 'report')}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {articles.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No articles yet.</p>
                      </div>
                    ) : (
                      articles.map((article) => (
                        <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getStatusText(article))}`}>
                                  {getStatusText(article)}
                                </span>
                                {article.views > 0 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{article.views} views</span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{article.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{article.content}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                <span>{article.author || 'Anonymous'}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(article, 'article')}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(article, 'article')}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(article, 'article')}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for View/Edit */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'view' ? 'View' : 'Edit'} {modalType.includes('report') ? 'Report' : 'Article'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Debug info */}
              <div className="mb-4 p-2 bg-gray-100 text-xs">
                Debug: Modal Type = "{modalType}", Is Report = {modalType.includes('report') ? 'Yes' : 'No'}
              </div>
              
              {modalType === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-gray-900">{selectedItem.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description/Content</label>
                    <p className="mt-1 text-gray-900">{selectedItem.description || selectedItem.content}</p>
                  </div>
                  {selectedItem.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-gray-900">{selectedItem.category}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                      {getStatusText(selectedItem)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-gray-900">{formatDate(selectedItem.created_at)}</p>
                  </div>
                </div>
              ) : (
                <EditForm 
                  item={selectedItem} 
                  type={modalType.includes('report') ? 'report' : 'article'}
                  modalType={modalType}
                  onSave={handleSaveItem}
                  onCancel={() => setShowModal(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Edit Form Component
const EditForm = ({ item, type, modalType, onSave, onCancel }) => {
  console.log('EditForm Debug:', { item, type, modalType })
  
  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    content: item.content || '',
    category: item.category || 'fraud',
    status: item.status || 'pending',
    published: item.published || false
  })

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      {type === 'report' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fraud">Financial Fraud</option>
              <option value="phishing">Phishing</option>
              <option value="harassment">Online Harassment</option>
              <option value="deepfake">Deepfake</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Published</label>
          </div>
        </>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

export default Profile
