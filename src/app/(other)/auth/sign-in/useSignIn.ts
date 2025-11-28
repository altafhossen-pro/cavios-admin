import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { adminLogin } from '@/features/admin/api/adminApi'
import type { UserType } from '@/types/auth'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { saveSession, fetchProfile } = useAuthContext()
  const [searchParams] = useSearchParams()

  const { showNotification } = useNotificationContext()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) navigate(redirectLink)
    else navigate('/')
  }

  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    try {
      const response = await adminLogin({
        email: values.email,
        password: values.password,
      })

      if (response.success && response.data.token) {
        // Save token first (minimal data for now)
        const userData: UserType = {
          id: response.data.admin._id,
          email: response.data.admin.email,
          username: response.data.admin.email.split('@')[0],
          firstName: response.data.admin.name?.split(' ')[0] || '',
          lastName: response.data.admin.name?.split(' ').slice(1).join(' ') || '',
          role: response.data.admin.role || 'Admin',
          token: response.data.token,
        }

        saveSession(userData)
        
        // Fetch full profile after login
        await fetchProfile()
        
        redirectUser()
        showNotification({ message: response.message || 'Successfully logged in. Redirecting....', variant: 'success' })
      } else {
        showNotification({ message: response.message || 'Login failed. Please check your credentials.', variant: 'danger' })
      }
    } catch (e: unknown) {
      console.error('Login error:', e)
      const error = e as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login'
      showNotification({ message: errorMessage, variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
