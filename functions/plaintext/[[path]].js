import { proxy } from '../../pages-lib/estate-proxy.js'
export const onRequest = (context) => proxy(context, { prefix: '/plaintext', host: 'plaintext.numetal.xyz', name: 'plaintext' })
