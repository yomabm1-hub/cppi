const TOKEN_TABLE = {
  USDT: {
    BEP20: { contract: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    POLYGON: { contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    ARBITRUM: { contract: '0xfd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9', decimals: 6 },
    OPTIMISM: { contract: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
  },
  USDC: {
    BEP20: { contract: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    POLYGON: { contract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    ARBITRUM: { contract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
    OPTIMISM: { contract: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6 },
  },
}

const padTo64 = (value) => value.replace(/^0x/, '').padStart(64, '0')

const sanitizeAddress = (address) => {
  if (!address) {
    throw new Error('Recipient address is required')
  }
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error('Recipient address must be a valid 42-character hex value')
  }
  return address.toLowerCase()
}

const parseUnits = (value, decimals) => {
  if (value === undefined || value === null) {
    throw new Error('Amount is required')
  }
  const normalized = String(value).replace(/,/g, '').trim()
  if (!normalized || Number(normalized) < 0) {
    throw new Error('Amount must be a positive number')
  }
  const [wholePart, fractionPart = ''] = normalized.split('.')
  const sanitizedWhole = wholePart.replace(/\D/g, '') || '0'
  const sanitizedFraction = fractionPart.replace(/\D/g, '')
  const paddedFraction = (sanitizedFraction + '0'.repeat(decimals)).slice(0, decimals)
  const combined = `${sanitizedWhole}${paddedFraction}`.replace(/^0+/, '') || '0'
  return BigInt(combined)
}

export const getTokenConfig = (currency, network) => {
  if (!currency || !network) return null
  return TOKEN_TABLE[currency]?.[network] || null
}

export const buildTokenTransferTx = ({ from, to, amount, currency, network }) => {
  const tokenConfig = getTokenConfig(currency, network)
  if (!tokenConfig) {
    throw new Error(`MetaMask payouts are not configured for ${currency} on ${network}`)
  }
  if (!from) {
    throw new Error('MetaMask account is not connected')
  }

  const recipient = sanitizeAddress(to)
  const amountUnits = parseUnits(amount, tokenConfig.decimals)
  const methodId = '0xa9059cbb'
  const addressParam = padTo64(recipient)
  const amountParam = padTo64(amountUnits.toString(16))
  const data = `${methodId}${addressParam}${amountParam}`

  return {
    from,
    to: tokenConfig.contract,
    data,
    value: '0x0',
  }
}

