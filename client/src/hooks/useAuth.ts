import { useEffect, useState } from 'react'
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setIsLoading(false)
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        setUser(session?.user || null)
        setIsLoading(false)
      })
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    checkSession()
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  }
}

export default useAuth;