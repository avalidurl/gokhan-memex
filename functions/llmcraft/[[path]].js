import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/llmcraft',
  host: 'llmcraft.numetal.xyz',
  name: 'LLMCraft',
  api: /^\/api(\/|$)/,
})
