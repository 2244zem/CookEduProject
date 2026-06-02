import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export const COOKEDU_WALLET_REFRESH_EVENT = 'cookedu-wallet-refresh'

export function notifyWalletRefresh() {
  window.dispatchEvent(new CustomEvent(COOKEDU_WALLET_REFRESH_EVENT))
}

export function useRealtimeWallet(userId?: string | number | null) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const walletUserId = userId ? String(userId) : ''

  const refresh = useCallback(async () => {
    if (!walletUserId || !isSupabaseConfigured || !supabase) {
      setBalance(0)
      return 0
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('coin_balance')
        .eq('user_id', walletUserId)
        .maybeSingle()

      if (error) throw error

      const nextBalance = Number(data?.coin_balance || 0)
      setBalance(nextBalance)
      return nextBalance
    } catch (error) {
      console.warn('CookEdu wallet sync failed:', error)
      return 0
    } finally {
      setLoading(false)
    }
  }, [walletUserId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!walletUserId || !isSupabaseConfigured || !supabase) return

    const channel = supabase
      .channel(`wallet_realtime_${walletUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_wallets', filter: `user_id=eq.${walletUserId}` },
        (payload) => {
          const nextBalance = Number((payload.new as { coin_balance?: number } | null)?.coin_balance || 0)
          setBalance(nextBalance)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [walletUserId])

  useEffect(() => {
    const handleRefresh = () => {
      void refresh()
    }

    window.addEventListener(COOKEDU_WALLET_REFRESH_EVENT, handleRefresh)
    return () => window.removeEventListener(COOKEDU_WALLET_REFRESH_EVENT, handleRefresh)
  }, [refresh])

  return { balance, loading, refresh }
}
