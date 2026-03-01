import { getUserBalance, updateUserBalance, addTransaction } from './balanceService.js'
import { adminSupabase } from '../lib/adminClient.js'

// Top-up
export const handleBalanceTopUp = async (userId, amount, paypalId = null) => {
  try {
    const currentBalance = await getUserBalance(userId)
    const newBalance = currentBalance + amount

    await updateUserBalance(userId, newBalance)

    await addTransaction({
      user_id: userId,
      transaction_type: 'topup',
      amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: 'Top-up via PayPal',
      paypal_transaction_id: paypalId
    })

    return { success: true, newBalance }
  } catch (err) {
    console.error('Top-up error:', err)
    return { success: false }
  }
}

// Purchase premium
export const handlePremiumPurchase = async (userId, planType, price) => {
  try {
    const currentBalance = await getUserBalance(userId)

    if (currentBalance < price) {
      return {
        success: false,
        error: 'Insufficient balance',
        currentBalance
      }
    }

    const newBalance = currentBalance - price
    await updateUserBalance(userId, newBalance)

    await addTransaction({
      user_id: userId,
      transaction_type: 'purchase',
      amount: price,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: `Premium: ${planType}`
    })

    const { error } = await adminSupabase
      .from('premium_subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        price,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) throw error

    return { success: true, newBalance }
  } catch (err) {
    console.error('Purchase error:', err)
    return { success: false }
  }
}