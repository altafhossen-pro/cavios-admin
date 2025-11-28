import { lazy, Suspense } from 'react'

import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { getMenuItems } from '@/helpers/menu'
import NewHoverMenuToggle from './components/NewHoverMenuToggle'

const NewAppMenu = lazy(() => import('./components/NewAppMenu'))

const NewVerticalNavigationBar = () => {
  const menuItems = getMenuItems()

  return (
    <div className="main-nav" id="leftside-menu-container">
      <LogoBox containerClassName="logo-box" squareLogo={{ className: 'logo-sm' }} textLogo={{ className: 'logo-lg' }} />

      <NewHoverMenuToggle />

      <SimplebarReactClient className="scrollbar">
        <Suspense fallback={<FallbackLoading />}>
          <NewAppMenu menuItems={menuItems} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}

export default NewVerticalNavigationBar

