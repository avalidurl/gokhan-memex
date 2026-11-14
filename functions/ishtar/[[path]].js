import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/ishtar',
  host: 'api.ishtar.numetal.xyz',
  name: 'Ishtar',
  api: /^\/(api|health|mcp|skill|openapi\.json|\.well-known)(\/|$)/,
})
