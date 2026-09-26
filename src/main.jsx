import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initSentry } from '@/infrastructure/sentry.js'
import SentryErrorBoundary from '@/components/SentryErrorBoundary.jsx'
import './index.scss'
import App from './App.jsx'

initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SentryErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SentryErrorBoundary>
  </StrictMode>,
)
