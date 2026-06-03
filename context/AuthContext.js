'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

function normalizeUser(userData) {
  if (!userData) return null
  const name = userData.name || ''
  const [firstName, ...rest] = name.split(' ')
  return {
    ...userData,
    firstName: userData.firstName || firstName || null,
    lastName: userData.lastName || rest.join(' ') || null,
    fullName: userData.fullName || name || null,
    imageUrl: userData.imageUrl || userData.image || null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  const refreshUser = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/auth/me')
      setUser(normalizeUser(data.user ?? null))
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    refreshUser()
    // Ensure axios sends cookies for same-origin API requests
    try {
      axios.defaults.withCredentials = true
    } catch (e) {
      /* ignore in non-browser environments */
    }
  }, [])

  const signIn = async (payload) => {
    const { data } = await axios.post('/api/auth/login', payload)
    if (data.user) setUser(normalizeUser(data.user))
    return data
  }

  const signUp = async (payload) => {
    const { data } = await axios.post('/api/auth/signup', payload)
    if (data.user) setUser(normalizeUser(data.user))
    return data
  }

  const signOut = async () => {
    await axios.post('/api/auth/logout')
    setUser(null)
  }

  const getToken = async () => null

  return (
    <AuthContext.Provider value={{ user, loading, isLoaded, signIn, signUp, signOut, refreshUser, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
