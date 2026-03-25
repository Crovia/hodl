'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const globalCache = new Map<string, string | null>()
const pendingAddresses = new Set<string>()
let batchTimer: ReturnType<typeof setTimeout> | null = null
const batchCallbacks: Array<() => void> = []

const BATCH_DELAY = 100
const BATCH_SIZE = 50

async function flushBatch() {
  if (pendingAddresses.size === 0) return

  const addresses = Array.from(pendingAddresses).slice(0, BATCH_SIZE)
  pendingAddresses.clear()
  batchTimer = null

  try {
    const res = await fetch('/api/cronos-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses }),
    })

    if (res.ok) {
      const data: Record<string, string | null> = await res.json()
      for (const [addr, name] of Object.entries(data)) {
        globalCache.set(addr.toLowerCase(), name)
      }
    }
  } catch {
    // Silent fail
  }

  const cbs = [...batchCallbacks]
  batchCallbacks.length = 0
  for (const cb of cbs) cb()
}

function queueAddress(address: string, callback: () => void) {
  const lower = address.toLowerCase()
  if (globalCache.has(lower)) {
    callback()
    return
  }

  pendingAddresses.add(lower)
  batchCallbacks.push(callback)

  if (batchTimer) clearTimeout(batchTimer)
  batchTimer = setTimeout(flushBatch, BATCH_DELAY)
}

/**
 * Hook to batch-resolve multiple addresses to Cronos IDs.
 */
export function useCronosIds(addresses: string[]): {
  cronosIds: Record<string, string | null>
  loading: boolean
} {
  const [cronosIds, setCronosIds] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(false)
  const prevAddressesRef = useRef<string>('')

  const refresh = useCallback(() => {
    const result: Record<string, string | null> = {}
    for (const addr of addresses) {
      const lower = addr.toLowerCase()
      if (globalCache.has(lower)) {
        result[lower] = globalCache.get(lower) ?? null
      }
    }
    setCronosIds(result)
  }, [addresses])

  useEffect(() => {
    const valid = addresses.filter(a => /^0x[a-fA-F0-9]{40}$/.test(a))
    const key = valid.sort().join(',')
    if (key === prevAddressesRef.current) return
    prevAddressesRef.current = key

    if (valid.length === 0) {
      setCronosIds({})
      setLoading(false)
      return
    }

    const uncached = valid.filter(a => !globalCache.has(a.toLowerCase()))
    if (uncached.length === 0) {
      refresh()
      setLoading(false)
      return
    }

    setLoading(true)
    let remaining = uncached.length

    for (const addr of uncached) {
      queueAddress(addr, () => {
        remaining--
        if (remaining <= 0) {
          refresh()
          setLoading(false)
        }
      })
    }
  }, [addresses, refresh])

  return { cronosIds, loading }
}