import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/apex',
  host: 'apex.numetal.xyz',
  name: 'APEX',
  api: /^\/api(\/|$)/,
})
