import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/accumulator',
  host: 'accumulator.numetal.xyz',
  name: 'Accumulator',
  api: /^\/api(\/|$)/,
})
