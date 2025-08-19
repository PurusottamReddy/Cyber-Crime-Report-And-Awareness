import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { BookOpen, Plus, Edit2, Trash2, Eye, Calendar, User } from 'lucide-react'

const Articles = () => {
  const { user, loading: authLoading } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', author: '', content: '', published: false })
  const [expandedArticles, setExpandedArticles] = useState(new Set())

  const toggleArticleExpansion = (articleId) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  // Fetch on mount and when auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchArticles()
    }
  }, [authLoading, user])
  
  // Re-fetch when returning to the tab (only if auth is loaded)
  useEffect(() => {
    const onVisible = () => { 
      if (document.visibilityState === 'visible' && !authLoading) {
        fetchArticles() 
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [authLoading, user])

  const fetchArticles = useCallback(async () => {
    console.log('fetchArticles called - authLoading:', authLoading, 'user:', user)
    console.log('User details:', user ? { id: user.id, email: user.email } : 'No user')
    setLoading(true)
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!user) {
        console.log('No user, fetching only published articles')
        query = query.eq('published', true)
      } else {
        console.log('User authenticated, fetching all articles for user:', user.id)
      }

      const { data, error } = await query
      if (error) {
        console.error('Supabase error:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        throw error
      }
      console.log('Articles fetched successfully:', data?.length || 0, 'articles')
      console.log('Articles data:', data)
      setArticles(data || [])
    } catch (e) {
      console.error('Error fetching articles:', e)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [user, authLoading])

  const openNew = () => {
    if (!user) { window.location.href = '/auth'; return }
    setEditing(null)
    setForm({ title: '', author: (user?.user_metadata?.name || user?.email || ''), content: '', published: false })
    setShowForm(true)
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        const { error } = await supabase
          .from('articles')
          .update({ title: form.title, author: form.author, content: form.content, published: form.published })
          .eq('id', editing.id)
          .select()
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([{ user_id: user.id, title: form.title, author: form.author, content: form.content, published: form.published }])
          .select()
        if (error) throw error
      }
      await fetchArticles()
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const onEdit = (article) => {
    if (!user || article.user_id !== user.id) return
    setEditing(article)
    setForm({ title: article.title, author: article.author || (user?.user_metadata?.name || user?.email || ''), content: article.content, published: article.published })
    setShowForm(true)
    setError('')
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this article?')) return
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id)
      if (error) throw error
      await fetchArticles()
    } catch (e) { console.error(e) }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{authLoading ? 'Loading authentication...' : 'Loading articles...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Articles</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Security tips and insights</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={fetchArticles} 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button onClick={openNew} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-5 w-5 mr-2" /> New Article
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Article' : 'Create Article'}</h2>
                {error && (
                  <div className="mb-3 p-3 rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400">{error}</div>
                )}
                <form onSubmit={onSubmit} className="space-y-6" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Article title..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author *</label>
                    <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
                    <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={12} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Write your article content here..." />
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 bg-white dark:bg-gray-700" />
                    <label htmlFor="published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Publish immediately</label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">{submitting ? 'Saving...' : (editing ? 'Update Article' : 'Create Article')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No articles yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => {
              const isExpanded = expandedArticles.has(a.id)
              const contentLength = a.content.length
              const shouldTruncate = contentLength > 150
              const displayContent = isExpanded ? a.content : (shouldTruncate ? a.content.slice(0, 150) + '...' : a.content)
              
              return (
                <article key={a.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {a.published ? <Eye className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                        <span className={`text-xs font-medium ${a.published ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{a.published ? 'Published' : 'Draft'}</span>
                      </div>
                      {user && a.user_id === user.id && (
                        <div className="flex space-x-1">
                          <button onClick={() => onEdit(a)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => onDelete(a.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">{a.title}</h2>
                    <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      <p className={isExpanded ? '' : 'line-clamp-4'}>
                        {displayContent}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleArticleExpansion(a.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm mt-2 focus:outline-none"
                        >
                          {isExpanded ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-top border-gray-100 dark:border-gray-700">
                      <div className="flex items-center"><User className="h-3 w-3 mr-1" />{a.author || 'Author'}</div>
                      <div className="flex items-center"><Calendar className="h-3 w-3 mr-1" />{formatDate(a.created_at)}</div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Articles


