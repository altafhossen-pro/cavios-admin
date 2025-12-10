import { lazy, Suspense } from 'react'

import FallbackLoading from '@/components/FallbackLoading'
import Footer from '@/components/layout/Footer'
import type { ChildrenType } from '@/types/component-props'
import Preloader from '@/components/Preloader'

const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar'))
const NewVerticalNavigationBar = lazy(() => import('@/components/layout/NewVerticalNavigationBar'))

const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <div className="wrapper">
      <Suspense fallback={<FallbackLoading />}>
        <TopNavigationBar />
      </Suspense>

      <Suspense fallback={<FallbackLoading />}>
        <NewVerticalNavigationBar />
      </Suspense>

      <div className="page-content">
        <div className="container-xxl">
          <Suspense fallback={<Preloader />}>{children}</Suspense>
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
