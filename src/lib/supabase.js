import { createClient } from '@supabase/supabase-js'
import { withRateLimit, supabaseRateLimiter, authRateLimiter, balanceRateLimiter } from './rateLimiter.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single Supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Helper function to create Supabase client with Clerk token
export const createSupabaseClientWithToken = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}

// Create user in Supabase if not exists
export const createSupabaseUser = async (clerkUser) => {
  return withRateLimit(async () => {
    try {
      // Use service role key for admin operations (bypass RLS)
      const serviceClient = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
      
      // Convert Clerk ID to remove 'user_' prefix for Supabase
      const userId = clerkUser.id.startsWith('user_') ? clerkUser.id.replace('user_', '') : clerkUser.id;
      
      // Check if user exists
      const { data: existingUser } = await serviceClient
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()
      
      if (existingUser) {
        return existingUser;
      }
      
      // Create new user
      const { data, error } = await serviceClient
        .from('users')
        .insert({
          id: userId,
          clerk_id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress,
          name: clerkUser.firstName || 'User',
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
          balance: 0
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }, authRateLimiter, `auth:${clerkUser.id}`)
}

// Get user by Clerk ID
export const getUserByClerkId = async (clerkId) => {
  try {
    // Use service role key for admin operations (bypass RLS)
    const serviceClient = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
    
    const { data, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error)
    return null
  }
}

// Get user balance
export const getUserBalance = async (userId) => {
  return withRateLimit(async () => {
    try {
      // Use service role key for admin operations (bypass RLS)
      const serviceClient = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
      
      const { data, error } = await serviceClient
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data?.balance || 0
    } catch (error) {
      console.error('Error fetching balance:', error)
      return 0
    }
  }, balanceRateLimiter, `balance:${userId}`)
}

// Update user balance
export const updateUserBalance = async (userId, newBalance) => {
  return withRateLimit(async () => {
    try {
      // Use service role key for admin operations (bypass RLS)
      const serviceClient = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
      
      const { data, error } = await serviceClient
        .from('users')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating balance:', error)
      return null
    }
  }, balanceRateLimiter, `balance:${userId}`)
}

// Add balance transaction
export const addBalanceTransaction = async (transaction) => {
  return withRateLimit(async () => {
    try {
      // Use service role key for admin operations (bypass RLS)
      const serviceClient = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
      
      const { data, error } = await serviceClient
        .from('balance_transactions')
        .insert([transaction])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding transaction:', error)
      return null
    }
  }, balanceRateLimiter, `transaction:${transaction.user_id}`)
}

// Handle balance top-up
export const handleBalanceTopUp = async (userId, amount, paypalTransactionId = null) => {
  try {
    // Get current balance
    const currentBalance = await getUserBalance(userId);
    
    // Update balance
    const newBalance = currentBalance + amount;
    await updateUserBalance(userId, newBalance);
    
    // Add transaction record
    await addBalanceTransaction({
      user_id: userId,
      transaction_type: 'topup',
      amount: amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: 'Balance top-up via PayPal',
      paypal_transaction_id: paypalTransactionId
    })
    
    return { success: true, newBalance }
  } catch (error) {
    console.error('Error handling top-up:', error)
    return { success: false, error }
  }
}

// Handle premium purchase
export const handlePremiumPurchase = async (userId, planType, price) => {
  try {
    // Use service role key for admin operations (bypass RLS)
    const serviceClient = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
    
    // Get current balance
    const currentBalance = await getUserBalance(userId);
    
    // Check if sufficient balance
    if (currentBalance < price) {
      return { 
        success: false, 
        error: 'Insufficient balance',
        required: price,
        current: currentBalance
      }
    }
    
    // Update balance
    const newBalance = currentBalance - price;
    await updateUserBalance(userId, newBalance);
    
    // Add transaction record
    await addBalanceTransaction({
      user_id: userId,
      transaction_type: 'purchase',
      amount: price,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: `Premium purchase: ${planType}`
    })
    
    // Add subscription
    const { error: subError } = await serviceClient
      .from('premium_subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        price: price,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
    
    if (subError) throw subError
    
    return { success: true, newBalance }
  } catch (error) {
    console.error('Error handling purchase:', error)
    return { success: false, error }
  }
}