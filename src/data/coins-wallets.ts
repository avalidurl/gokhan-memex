/** Watched wallets: the "By" column of the coin register. Full addresses, so the lookup can match them. */
export interface Party { id: string; label?: string; address?: string; short: string; note?: string; chain?: 'evm' | 'solana' | 'canton' }

export const parties: Party[] = [
  { id: 'W1', label: 'gokhan.eth', address: '0x36de990133D36d7E3DF9a820aA3eDE5a2320De71', short: '0x36de…2320De71', note: 'main deployer' },
  { id: 'W2', address: '0xC32F2122A76CE07bDdc785e44978859B713DA6ef', short: '0xC32F…13DA6ef' },
  { id: 'W3', label: 'agentbountydev.eth', address: '0x15813fBeac0Ac58FA087C459639F8DC64a9B93c3', short: '0x15813f…9B93c3' },
  { id: 'W4', label: '0xgokhan.eth', address: '0x30a00361a389cdc41053A6A010118D173cce1f70', short: '0x30a003…cce1f70' },
  { id: 'W5', address: '0x746692cd719132fF43f274AB343B4C85363d94A9', short: '0x746692…5363d94A9' },
  { id: 'W6', address: '0xE85aC08dbd873441708c737D9b2f86D8b7ca85Aa', short: '0xE85aC0…8b7ca85Aa' },
  { id: 'W7', label: 'personal (Bankr)', address: '0x8f49d4d782488e8576c8c54288027c57f4acf521', short: '0x8f49d4…57f4Acf521' },
  { id: 'W8', label: 'agentbounty (Bankr)', short: '0x2f56…e105a7' },
  { id: 'W9', label: 'goekhanvc (Bankr)', address: '0xdd2a6bd2506d2f50b06905e12bea27df15415f8e', short: '0xdd2a…415f8e' },
  { id: 'W10', label: 'gigabvgatti (Bankr)', address: '0x93a55e1ad85f686b836a66c31917e7429e49945d', short: '0x93a5…9945d' },
  { id: 'W11', label: 'Kernel 7702', address: '0x82e435998e47ba95ccf6e9dc58fd00c2505397e8', short: '0x82e4…505397e8' },
  { id: 'W12', address: '0xaBDD21cCEcA2B1DB61A32bdacA3c5621B7da128e', short: '0xaBDD…7da128e' },
  { id: 'W13', label: 'Kernel 7702', address: '0xcd3ef09df10d2b18bf836e93d3f228f6a4c3ab9b', short: '0xcd3E…A4C3ab9B', note: 'was KERNEL' },
  { id: 'W14', label: 'Canton (Supanova)', address: 'supa1::1220fee177fe9fb494a1b8b4ff0fb6d8882b80f4d0e55df1d90a2faf821fbff6ac61', short: 'supa1::1220fee1…fbff6ac61', chain: 'canton' },
  { id: 'ZORA', label: 'Zora / Base App wallet', short: '0xd071b9…48Ac97c1d8', note: 'payout of all Zora coins' },
  { id: 'AUTH', label: 'Paragraph factory', short: 'author-side' },
  { id: 'SOL', label: 'Solana signer', address: '2GvLgz2ovzNkrYEzJsZ1kRovXjVQnmm7WRWFd3vFzsma', short: '2GvLgz…FzsMa', note: 'pump.fun @gokhan, StonkFun', chain: 'solana' },
  { id: 'NX', label: 'numetalxyz-x', short: 'feel.cash/users/numetalxyz-x' },
]
