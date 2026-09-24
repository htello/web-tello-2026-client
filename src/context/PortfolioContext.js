import { createContext, useContext } from 'react'

export const PortfolioContext = createContext(null)

/**
 * Accede al estado público del portfolio compartido por PortfolioProvider.
 * @returns {ReturnType<import('@/hooks/usePortfolio.js').usePortfolio>}
 */
export function usePortfolioContext() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolioContext debe usarse dentro de PortfolioProvider')
  }
  return context
}
