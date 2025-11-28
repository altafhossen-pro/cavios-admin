import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'

import AuthLayout from '@/layouts/AuthLayout'
import { useAuthContext } from '@/context/useAuthContext'
import { appRoutes, authRoutes } from '@/routes/index'
import AdminLayout from '@/layouts/AdminLayout'
import Spinner from '@/components/Spinner'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated, isLoading } = useAuthContext()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', width: '100vw' }}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {(authRoutes || []).map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={<AuthLayout {...props}>{route.element}</AuthLayout>} />
      ))}

      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            isAuthenticated ? (
              <AdminLayout {...props}>{route.element}</AdminLayout>
            ) : (
              <Navigate
                to={{
                  pathname: '/auth/sign-in',
                  search: 'redirectTo=' + route.path,
                }}
              />
            )
          }
        />
      ))}
    </Routes>
  )
}

export default AppRouter
