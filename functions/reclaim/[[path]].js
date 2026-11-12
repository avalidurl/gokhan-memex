import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/reclaim',
  host: 'reclaim.numetal.xyz',
  name: 'Reclaim',
  api: /^\/(api|pin|mcp|ipfs|dl|og|health)(\/|$)/,
})
