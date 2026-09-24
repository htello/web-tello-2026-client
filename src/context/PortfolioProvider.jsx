import { usePortfolio } from '@/hooks/usePortfolio.js'
import { PortfolioContext } from './PortfolioContext.js'

export function PortfolioProvider({ children }) {
  const value = usePortfolio()

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}
