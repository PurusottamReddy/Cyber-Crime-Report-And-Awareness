import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit2, Trash2, Eye, Calendar, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

const Awareness = () => {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    published: false,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

      // Show all blogs for authenticated users, only published for others
      if (!user) {
        query = query.eq('published', true)
      }

      const { data, error } = await query

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update(formData)
          .eq('id', editingBlog.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([formData])

        if (error) throw error
      }

      await fetchBlogs()
      setShowForm(false)
      setEditingBlog(null)
      setFormData({ title: '', content: '', author: '', published: false })
    } catch (error) {
      console.error('Error saving blog:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      published: blog.published,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading awareness articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cybersecurity Awareness</h1>
              <p className="text-gray-600 mt-1">Stay informed with the latest security tips and insights</p>
            </div>
          </div>

          {user && (
            <button
              onClick={() => {
                setShowForm(true)
                setEditingBlog(null)
                setFormData({ title: '', content: '', author: user.user_metadata?.name || user.email || '', published: false })
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Article
            </button>
          )}
        </div>

        {/* Article Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {editingBlog ? 'Edit Article' : 'Create New Article'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Article title..."
                    />
                  </div>

                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                      Author *
                    </label>
                    <input
                      type="text"
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Author name..."
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      required
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Write your article content here... You can use markdown formatting."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                      Publish immediately
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Saving...' : (editingBlog ? 'Update Article' : 'Create Article')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No articles published yet.</p>
            {user && (
              <p className="text-gray-400 mt-2">Be the first to share cybersecurity knowledge!</p>
            )}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Article Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {blog.published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs font-medium ${
                        blog.published ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    {user && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {truncateContent(blog.content)}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {blog.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(blog.created_at)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Featured Tips Section */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Security Tips</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Use Strong Passwords',
                tip: 'Create unique passwords with a mix of letters, numbers, and symbols'
              },
              {
                icon: '📱',
                title: 'Enable 2FA',
                tip: 'Add an extra layer of security to your important accounts'
              },
              {
                icon: '🔗',
                title: 'Verify Links',
                tip: 'Hover over links to check their destination before clicking'
              },
              {
                icon: '📧',
                title: 'Question Emails',
                tip: 'Be suspicious of unexpected emails asking for personal information'
              }
            ].map((tip, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-3">{tip.icon}</div>
                <h3 className="font-semibold mb-2">{tip.title}</h3>
                <p className="text-sm text-blue-100">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Awareness
