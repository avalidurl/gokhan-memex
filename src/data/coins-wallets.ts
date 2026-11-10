/** Watched wallets: the "By" column of the coin register. Full addresses, so the lookup can match them. */
export interface Party { id: string; label?: string; address?: string; short: string; note?: string; chain?: 'evm' | 'solana' | 'canton'; link?: string }

/** Explorer links for a party: EVM wallets get Base, Robinhood Chain and Ethereum; Solana gets Solscan; Canton gets CCView. */
export function explorers(p: Party): { label: string; short?: string; href: string }[] {
  if (p.link) return [{ label: 'Profile', short: 'profile', href: p.link }]
  if (!p.address) return []
  if (p.chain === 'solana') return [{ label: 'Solscan', short: 'SOL', href: `https://solscan.io/account/${p.address}` }, { label: 'pump.fun profile', short: 'pump', href: 'https://pump.fun/profile/gokhan' }]
  if (p.chain === 'canton') return [{ label: 'CCView (Canton explorer)', short: 'CCV', href: `https://ccview.io/party/${p.address}` }]
  return [
    { label: 'Basescan', short: 'BASE', href: `https://basescan.org/address/${p.address}` },
    { label: 'Robinhood Chain explorer', short: 'RH', href: `https://robinhoodchain.blockscout.com/address/${p.address}` },
    { label: 'Etherscan', short: 'ETH', href: `https://etherscan.io/address/${p.address}` },
  ]
}

export const parties: Party[] = [
  { id: 'W1', label: 'gokhan.eth', address: '0x36de990133D36d7E3DF9a820aA3eDE5a2320De71', short: '0x36de…2320De71', note: 'main deployer' },
  { id: 'W2', address: '0xC32F2122A76CE07bDdc785e44978859B713DA6ef', short: '0xC32F…13DA6ef' },
  { id: 'W3', label: 'agentbountydev.eth', address: '0x15813fBeac0Ac58FA087C459639F8DC64a9B93c3', short: '0x15813f…9B93c3' },
  { id: 'W4', label: '0xgokhan.eth', address: '0x30a00361a389cdc41053A6A010118D173cce1f70', short: '0x30a003…cce1f70' },
  { id: 'W5', address: '0x746692cd719132fF43f274AB343B4C85363d94A9', short: '0x746692…5363d94A9' },
  { id: 'W6', address: '0xE85aC08dbd873441708c737D9b2f86D8b7ca85Aa', short: '0xE85aC0…8b7ca85Aa' },
  { id: 'W7', label: 'personal (Bankr)', address: '0x8f49d4d782488e8576c8c54288027c57f4Acf521', short: '0x8f49d4…57f4Acf521' },
  { id: 'W8', label: 'agentbounty (Bankr)', address: '0x2F56e49B9ddB148D1BeF469f14bBD91F39E105A7', short: '0x2F56…E105A7' },
  { id: 'W9', label: 'goekhanvc (Bankr)', address: '0xDD2A6bd2506d2f50B06905E12BeA27Df15415f8E', short: '0xdd2a…415f8e' },
  { id: 'W10', label: 'gigabvgatti (Bankr)', address: '0x93A55E1aD85f686b836a66C31917E7429e49945d', short: '0x93a5…9945d' },
  { id: 'W11', label: 'Kernel 7702', address: '0x82E435998E47Ba95CCf6E9dC58fd00c2505397e8', short: '0x82e4…505397e8' },
  { id: 'W12', address: '0xaBDD21cCEcA2B1DB61A32bdacA3c5621B7da128e', short: '0xaBDD…7da128e' },
  { id: 'W13', label: 'Kernel 7702', address: '0xcd3Ef09Df10d2B18BF836E93d3F228f6A4C3ab9B', short: '0xcd3E…A4C3ab9B', note: 'was KERNEL' },
  { id: 'W14', label: 'Canton (Supanova)', address: 'supa1::1220fee177fe9fb494a1b8b4ff0fb6d8882b80f4d0e55df1d90a2faf821fbff6ac61', short: 'supa1::1220fee1…fbff6ac61', chain: 'canton' },
  { id: 'ZORA', label: 'Zora / Base App wallet', address: '0xD071B9c281F789F85232Aa2264d54648Ac97c1d8', short: '0xD071…97c1d8', note: 'payout of all Zora coins' },
  { id: 'AUTH', label: 'Paragraph factory', short: 'author-side', note: 'coins minted by the Paragraph factory for his posts; no single wallet' },
  { id: 'SOL', label: 'Solana signer', address: '2GvLgz2ovzNkrYEzJsZ1kRovXjVQnmm7WRWFd3vFzsma', short: '2GvLgz…FzsMa', note: 'pump.fun @gokhan; also signs his StonkFun launches', chain: 'solana' },
  { id: 'NX', label: 'numetalxyz-x', short: 'feel.cash/users/numetalxyz-x', note: 'Feel.cash account, no wallet address published', link: 'https://feel.cash/users/numetalxyz-x' },
]
