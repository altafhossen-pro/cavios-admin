import { Link } from 'react-router-dom'

import type { LogoBoxProps } from '@/types/component-props'

import logoDark from '@/assets/images/logo-dark.png'
import logoLight from '@/assets/images/logo-light.png'
import logoSmDark from '@/assets/images/logo-sm-dark.png'
import logoSmLight from '@/assets/images/logo-sm-light.png'

const LogoBox = ({ containerClassName, squareLogo, textLogo }: LogoBoxProps) => {
  return (
    <div className={containerClassName ?? ''}>
      <Link to="/" className="logo-dark">
        <img src={logoSmDark} className={squareLogo?.className} height={squareLogo?.height ?? 30} width={squareLogo?.width ?? 30} alt="logo sm" />
        <img src={logoDark} className={textLogo?.className} height={textLogo?.height ?? 30} width={textLogo?.width ?? 70} alt="logo dark" />
      </Link>
      <Link to="/" className="logo-light">
        <img src={logoSmLight} className={squareLogo?.className} height={squareLogo?.height ?? 30} width={squareLogo?.width ?? 30} alt="logo sm" />
        <img src={logoLight} className={textLogo?.className} height={textLogo?.height ?? 30} width={textLogo?.width ?? 70} alt="logo light" />
      </Link>
    </div>
  )
}

export default LogoBox
