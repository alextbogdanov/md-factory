// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ============================================================================
// ### COMPONENTS ###
// ============================================================================
import App from './App'

// ============================================================================
// ### ASSETS ###
// ============================================================================
import './index.css'

// ============================================================================
// ### CONFIGURATIONS ###
// ============================================================================
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
const queryClient = new QueryClient()

// ============================================================================
// ### CUSTOM ###
// ============================================================================
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ConvexProvider>
  </StrictMode>
)
