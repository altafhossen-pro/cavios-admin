import type { UserType } from '@/types/auth'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import { getAdminProfile } from '@/features/admin/api/adminApi'

export type AuthContextType = {
  user: UserType | undefined
  isAuthenticated: boolean
  isLoading: boolean
  saveSession: (session: UserType) => void
  removeSession: () => void
  fetchProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

const authSessionKey = '_REBACK_AUTH_KEY_'

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserType | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const getSession = (): AuthContextType['user'] => {
    const fetchedCookie = getCookie(authSessionKey)?.toString()
    if (!fetchedCookie) return
    try {
      return JSON.parse(fetchedCookie)
    } catch (e) {
      return undefined
    }
  }

  const removeSession = useCallback(() => {
    deleteCookie(authSessionKey)
    setUser(undefined)
    setIsLoading(false)
    navigate('/auth/sign-in')
  }, [navigate])

  // Fetch admin profile from API
  const fetchProfile = useCallback(async () => {
    try {
      const currentUser = user || getSession()
      if (!currentUser?.token) {
        setIsLoading(false)
        return
      }

      const response = await getAdminProfile()
      if (response.success && response.data) {
        // Transform backend admin data to UserType format
        const userData: UserType = {
          id: response.data._id,
          email: response.data.email,
          username: response.data.email?.split('@')[0] || '',
          firstName: response.data.name?.split(' ')[0] || '',
          lastName: response.data.name?.split(' ').slice(1).join(' ') || '',
          role: response.data.role || 'Admin',
          token: currentUser.token, // Keep existing token
        }
        setUser(userData)
        setCookie(authSessionKey, JSON.stringify(userData))
      } else {
        // If profile fetch fails, clear session
        removeSession()
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // If profile fetch fails, clear session
      removeSession()
    } finally {
      setIsLoading(false)
    }
  }, [user, removeSession])

  // Initialize: Check if user is logged in and fetch profile
  useEffect(() => {
    const initializeAuth = async () => {
      const session = getSession()
      if (session && session.token) {
        // User has token, set it temporarily and fetch profile
        setUser(session)
        await fetchProfile()
      } else {
        // No token, user is not logged in
        setUser(undefined)
        setIsLoading(false)
      }
    }
    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const saveSession = (userData: UserType) => {
    setCookie(authSessionKey, JSON.stringify(userData))
    setUser(userData)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!user.token,
        isLoading,
        saveSession,
        removeSession,
        fetchProfile,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
