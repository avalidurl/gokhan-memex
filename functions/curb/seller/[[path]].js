import { originOnRequest } from '../../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/curb/seller',
  host: 'seller.curb.numetal.xyz',
  name: 'CURB seller',
  api: /^\/(health|mcp|mcp-tools|api)(\/|$)/,
})
