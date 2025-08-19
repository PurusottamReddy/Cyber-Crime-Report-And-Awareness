import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthContext: Initializing auth state...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Initial session:', session?.user?.email || 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state change:', event, session?.user?.email || 'No user')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Create user record if needed
      if (session?.user && event === 'SIGNED_IN') {
        const { error } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
          })
        if (error) console.error('Error creating user record:', error)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    return { data, error }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user...')
      
      // Clear any local storage that might be causing issues
      localStorage.removeItem('supabase.auth.token')
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        // Force clear the session even if Supabase signOut fails
        setSession(null)
        setUser(null)
        return { error }
      }
      
      console.log('User signed out successfully')
      return { error: null }
    } catch (err) {
      console.error('Sign out exception:', err)
      // Force clear the session even if there's an exception
      setSession(null)
      setUser(null)
      return { error: err }
    }
  }

  // For anonymous reports we do NOT create a user record.
  // The reports table allows null user_id and RLS permits anon inserts.
  // Keep the function for API compatibility but make it a no-op.
  const createAnonymousUser = async () => {
    return null
  }

  const updateProfile = async (profileData) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone,
          organization: profileData.organization,
        }
      })
      
      if (error) throw error
      
      // Update local user state
      setUser(data.user)
      
      // Update user record in database
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          name: profileData.name,
          phone: profileData.phone,
          organization: profileData.organization,
        })
      
      if (dbError) console.error('Error updating user record:', dbError)
      
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    createAnonymousUser,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
