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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const createAnonymousUser = async () => {
    try {
      // Generate a unique anonymous ID
      const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: anonymousId,
          name: 'Anonymous User',
          is_anonymous: true,
        })
        .select()
        .single()

      if (error) throw error
      return anonymousId
    } catch (error) {
      console.error('Error creating anonymous user:', error)
      return null
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
