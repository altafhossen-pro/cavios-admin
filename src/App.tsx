import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper'
// import configureFakeBackend from './helpers/fake-backend' // Disabled - using real backend API
import AppRouter from './routes/router'

import '@/assets/scss/app.scss'

// Fake backend disabled - using real backend API
// configureFakeBackend()

const App = () => {
  return (
    <AppProvidersWrapper>
      <AppRouter />
    </AppProvidersWrapper>
  )
}

export default App
