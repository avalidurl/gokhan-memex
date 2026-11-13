import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/jesus',
  host: 'jesus.numetal.xyz',
  name: 'Personal Jesus',
  service: 'JESUS',
  api: /^\/join(\/|$)/,
})
