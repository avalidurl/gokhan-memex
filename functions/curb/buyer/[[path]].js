import { originOnRequest } from '../../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/curb/buyer',
  host: 'buyer.curb.numetal.xyz',
  name: 'CURB buyer',
  api: /^\/(health|mcp|mcp-tools|api)(\/|$)/,
})
