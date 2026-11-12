import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/plaintext',
  host: 'plaintext.numetal.xyz',
  name: 'plaintext',
  api: /^\/(api|pin|mcp|ipfs|dl|og|health|feed\.xml)(\/|$)/,
})
