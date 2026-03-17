import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const HEX_PREFIX = '0x'

const ensureHexChainId = (value) => {
  if (!value) return value
  return value.startsWith(HEX_PREFIX) ? value.toLowerCase() : Number(value).toString(16).padStart(1, '0')
}

export const METAMASK_NETWORKS = {
  BEP20: {
    key: 'BEP20',
    label: 'BNB Smart Chain (BEP20)',
    chainIdHex: '0x38',
    addParams: {
      chainId: '0x38',
      chainName: 'BNB Smart Chain',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com'],
    },
  },
  POLYGON: {
    key: 'POLYGON',
    label: 'Polygon (Mainnet)',
    chainIdHex: '0x89',
    addParams: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
  },
  ARBITRUM: {
    key: 'ARBITRUM',
    label: 'Arbitrum One',
    chainIdHex: '0xa4b1',
    addParams: {
      chainId: '0xa4b1',
      chainName: 'Arbitrum One',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io'],
    },
  },
  OPTIMISM: {
    key: 'OPTIMISM',
    label: 'Optimism',
    chainIdHex: '0xa',
    addParams: {
      chainId: '0xa',
      chainName: 'Optimism',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://mainnet.optimism.io'],
      blockExplorerUrls: ['https://optimistic.etherscan.io'],
    },
  },
}

const getProvider = () => {
  if (typeof window === 'undefined') return null
  return window.ethereum || null
}

export default function useMetaMaskWallet() {
  const providerRef = useRef(getProvider())
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isInstalled, setIsInstalled] = useState(Boolean(providerRef.current))
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  const provider = providerRef.current

  const refreshProviderState = useCallback(async () => {
    if (!provider) return
    try {
      const [accounts, networkChainId] = await Promise.all([
        provider.request({ method: 'eth_accounts' }).catch(() => []),
        provider.request({ method: 'eth_chainId' }).catch(() => null),
      ])

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
      }
      if (networkChainId) {
        setChainId(networkChainId.toLowerCase())
      }
    } catch (err) {
      console.error('MetaMask initialization error:', err)
    }
  }, [provider])

  useEffect(() => {
    if (!provider) {
      setIsInstalled(false)
      return undefined
    }

    setIsInstalled(true)
    refreshProviderState()

    const handleAccountsChanged = (accounts = []) => {
      setAccount(accounts[0] || null)
    }

    const handleChainChanged = (nextChainId) => {
      setChainId(nextChainId?.toLowerCase() || null)
    }

    provider.on?.('accountsChanged', handleAccountsChanged)
    provider.on?.('chainChanged', handleChainChanged)

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged)
      provider.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [provider, refreshProviderState])

  const requireProvider = useCallback(() => {
    const currentProvider = providerRef.current || getProvider()
    if (!currentProvider) {
      throw new Error('MetaMask extension not detected. Please install or enable it.')
    }
    providerRef.current = currentProvider
    setIsInstalled(true)
    return currentProvider
  }, [])

  const switchNetwork = useCallback(
    async (networkKey) => {
      if (!networkKey || !METAMASK_NETWORKS[networkKey]) return null
      const currentProvider = requireProvider()
      const target = METAMASK_NETWORKS[networkKey]
      try {
        await currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: target.chainIdHex }],
        })
      } catch (switchError) {
        if (switchError?.code === 4902 && target.addParams) {
          await currentProvider.request({
            method: 'wallet_addEthereumChain',
            params: [target.addParams],
          })
        } else {
          throw switchError
        }
      }
      setChainId(target.chainIdHex)
      return target.chainIdHex
    },
    [requireProvider]
  )

  const connect = useCallback(
    async (networkKey) => {
      setConnecting(true)
      setError(null)
      try {
        const currentProvider = requireProvider()
        if (networkKey && METAMASK_NETWORKS[networkKey]) {
          const target = METAMASK_NETWORKS[networkKey]
          if (chainId?.toLowerCase() !== target.chainIdHex) {
            await switchNetwork(networkKey)
          }
        }
        const accounts = await currentProvider.request({ method: 'eth_requestAccounts' })
        const nextAccount = accounts?.[0] || null
        const currentChain = await currentProvider.request({ method: 'eth_chainId' })

        setAccount(nextAccount)
        setChainId(currentChain?.toLowerCase() || null)
        return nextAccount
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setConnecting(false)
      }
    },
    [chainId, requireProvider, switchNetwork]
  )

  const disconnect = useCallback(() => {
    setAccount(null)
    setChainId(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const networkMatch = useCallback(
    (networkKey) => {
      if (!networkKey || !METAMASK_NETWORKS[networkKey] || !chainId) return true
      return METAMASK_NETWORKS[networkKey].chainIdHex === ensureHexChainId(chainId)
    },
    [chainId]
  )

  return useMemo(
    () => ({
      account,
      chainId,
      isInstalled,
      connecting,
      error,
      connect,
      disconnect,
      switchNetwork,
      networkMatch,
      clearError,
    }),
    [account, chainId, clearError, connect, connecting, error, isInstalled, networkMatch, switchNetwork]
  )
}

