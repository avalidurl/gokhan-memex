import { proxy } from '../../pages-lib/estate-proxy.js'
export const onRequest = (context) => proxy(context, { prefix: '/reclaim', host: 'reclaim.numetal.xyz', name: 'Reclaim' })
