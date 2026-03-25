/**
 * Cronos ID Resolution Service
 * Resolves 0x addresses to .cro domain names using on-chain registry.
 */

import { ethers } from 'ethers'

const CRONOS_RPC = 'https://evm.cronos.org'
const REGISTRY_ADDRESS = '0x7F4C61116729d5b27E5f180062Fdfbf32E9283E5'

const REGISTRY_ABI = [
  'function resolver(bytes32 node) view returns (address)',
]

const RESOLVER_ABI = [
  'function name(bytes32 node) view returns (string)',
]

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const cache = new Map<string, { name: string | null; resolvedAt: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

let provider: ethers.JsonRpcProvider | null = null
let registry: ethers.Contract | null = null

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(CRONOS_RPC, undefined, {
      staticNetwork: true,
      batchMaxCount: 10,
    })
  }
  return provider
}

function getRegistry(): ethers.Contract {
  if (!registry) {
    registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, getProvider())
  }
  return registry
}

export async function resolveCronosId(address: string): Promise<string | null> {
  const addr = address.toLowerCase()

  const cached = cache.get(addr)
  if (cached && Date.now() - cached.resolvedAt < CACHE_TTL) {
    return cached.name
  }

  try {
    const reverseNode = ethers.namehash(addr.slice(2) + '.addr.reverse')
    const resolverAddress = await getRegistry().resolver(reverseNode)

    if (!resolverAddress || resolverAddress === ZERO_ADDRESS) {
      cache.set(addr, { name: null, resolvedAt: Date.now() })
      return null
    }

    const resolverContract = new ethers.Contract(resolverAddress, RESOLVER_ABI, getProvider())
    const name: string = await resolverContract.name(reverseNode)

    if (!name || name === '') {
      cache.set(addr, { name: null, resolvedAt: Date.now() })
      return null
    }

    cache.set(addr, { name, resolvedAt: Date.now() })
    return name
  } catch {
    cache.set(addr, { name: null, resolvedAt: Date.now() })
    return null
  }
}

export async function batchResolveCronosIds(
  addresses: string[]
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {}
  const toResolve: string[] = []

  for (const addr of addresses) {
    const lower = addr.toLowerCase()
    const cached = cache.get(lower)
    if (cached && Date.now() - cached.resolvedAt < CACHE_TTL) {
      result[lower] = cached.name
    } else {
      toResolve.push(lower)
    }
  }

  if (toResolve.length === 0) return result

  const batch = toResolve.slice(0, 50)
  const settled = await Promise.allSettled(
    batch.map(async addr => {
      const name = await resolveCronosId(addr)
      return { addr, name }
    })
  )

  for (const item of settled) {
    if (item.status === 'fulfilled') {
      result[item.value.addr] = item.value.name
    }
  }

  return result
}