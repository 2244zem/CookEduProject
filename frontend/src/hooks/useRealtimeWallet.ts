import { useCallback, useEffect, useRef, useState } from 'react'
import { coinApi } from '../lib/api'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export const COOKEDU_WALLET_REFRESH_EVENT = 'cookedu-wallet-refresh'

export function notifyWalletRefresh(balance?: number) {
  window.dispatchEvent(new CustomEvent(COOKEDU_WALLET_REFRESH_EVENT, { detail: { balance } }))
}

export function useRealtimeWallet(userId?: string | number | null) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const walletUserId = userId ? String(userId) : ''
  const channelInstanceId = useRef(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  )

  const refresh = useCallback(async () => {
    if (!walletUserId || !isSupabaseConfigured || !supabase) {
      setBalance(0)
      return 0
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setLoading(false)
      return 0
    }

    setLoading(true)
    try {
      const response = await coinApi.walletBalance()
      const nextBalance = Number(response.data?.coin_balance || 0)
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

    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    const subscribe = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled || !session?.access_token) return

      const channelName = `wallet_realtime_${walletUserId}_${channelInstanceId.current}`
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_wallets', filter: `user_id=eq.${walletUserId}` },
          (payload) => {
            const nextBalance = (payload.new as { coin_balance?: number } | null)?.coin_balance
            if (typeof nextBalance === 'number') {
              setBalance(nextBalance)
              return
            }

            void refresh()
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('CookEdu wallet realtime unavailable; falling back to manual refresh.')
          }
        })
    }

    void subscribe()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [refresh, walletUserId])

  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const detail = (event as CustomEvent<{ balance?: number }>).detail
      if (typeof detail?.balance === 'number') {
        setBalance(detail.balance)
        return
      }

      void refresh()
    }

    window.addEventListener(COOKEDU_WALLET_REFRESH_EVENT, handleRefresh)
    return () => window.removeEventListener(COOKEDU_WALLET_REFRESH_EVENT, handleRefresh)
  }, [refresh])

  return { balance, loading, refresh }
}
