import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/numetal',
  host: 'numetal.xyz',
  name: 'Numetal',
  api: /^\/(fees\/data|fees\/events|api|airdrop-status\.json|airdrop\.json)(\/|$)/,
})
