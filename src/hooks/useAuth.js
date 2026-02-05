import { useContext, createContext } from 'react'
import { useUser } from '@clerk/clerk-react'

// Fallback context for when Clerk is not available
const FallbackAuthContext = createContext({
  isSignedIn: false,
  user: null,
  isLoaded: true,
})

export const useAuth = () => {
  try {
    // Try to use Clerk's useUser hook
    return useUser()
  } catch (error) {
    // Fallback when Clerk is not available
    return useContext(FallbackAuthContext)
  }
}
