/** Watched wallets: the "By" column of the coin register. Addresses are not published. */
export interface Party { id: string; label?: string; address?: string; short: string; note?: string; chain?: 'evm' | 'solana' | 'canton'; link?: string }

/** Explorer links for a party: EVM wallets get Base, Robinhood Chain and Ethereum; Solana gets Solscan; Canton gets CCView. */
export function explorers(p: Party): { label: string; short?: string; href: string }[] {
  if (p.link) return [{ label: 'Profile', short: 'profile', href: p.link }]
  if (!p.address) return []
  if (p.chain === 'solana') {
    return [{ label: 'Solscan', short: 'SOL', href: `https://solscan.io/account/${p.address}` }]
  }
  if (p.chain === 'canton') return [{ label: 'CCView (Canton explorer)', short: 'CCV', href: `https://ccview.io/party/${p.address}` }]
  return [
    { label: 'Basescan', short: 'BASE', href: `https://basescan.org/address/${p.address}` },
    { label: 'Robinhood Chain explorer', short: 'RH', href: `https://robinhoodchain.blockscout.com/address/${p.address}` },
    { label: 'Etherscan', short: 'ETH', href: `https://etherscan.io/address/${p.address}` },
  ]
}

export const parties: Party[] = [
  { id: 'W1', label: 'gokhan.eth', short: 'gokhan.eth', note: 'main deployer' },
  { id: 'W2', short: 'W2' },
  { id: 'W3', label: 'agentbountydev.eth', short: 'agentbountydev.eth' },
  { id: 'W4', label: '0xgokhan.eth', short: '0xgokhan.eth' },
  { id: 'W5', short: 'W5' },
  { id: 'W6', short: 'W6' },
  { id: 'W7', label: 'personal (Bankr)', short: 'personal (Bankr)' },
  { id: 'W8', label: 'agentbounty (Bankr)', short: 'agentbounty (Bankr)' },
  { id: 'W9', label: 'goekhanvc (Bankr)', short: 'goekhanvc (Bankr)' },
  { id: 'W10', label: 'gigabvgatti (Bankr)', short: 'gigabvgatti (Bankr)' },
  { id: 'W11', label: 'Kernel 7702', short: 'Kernel 7702' },
  { id: 'W12', short: 'W12' },
  { id: 'W13', label: 'Kernel 7702', short: 'Kernel 7702', note: 'was KERNEL' },
  { id: 'W14', label: 'Canton (Supanova)', short: 'Canton', chain: 'canton' },
  { id: 'ZORA', label: 'Zora / Base App wallet', short: 'Zora', note: 'payout of all Zora coins' },
  { id: 'AUTH', label: 'Paragraph factory', short: 'author-side', note: 'coins minted by the Paragraph factory for his posts; no single wallet' },
  { id: 'SOL-MAIN', label: 'Solana', short: 'Solana', note: 'main Solana address', chain: 'solana' },
  { id: 'SOL', label: 'Solana signer', short: 'Solana signer', note: 'signs his StonkFun launches', chain: 'solana' },
  { id: 'NX', label: 'numetalxyz-x', short: 'feel.cash/users/numetalxyz-x', note: 'Feel.cash account, no wallet address published', link: 'https://feel.cash/users/numetalxyz-x' },
]
