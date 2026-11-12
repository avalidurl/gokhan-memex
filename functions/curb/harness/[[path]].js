import { originOnRequest } from '../../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/curb/harness',
  host: 'harness.curb.numetal.xyz',
  name: 'CURB harness',
  api: /^\/(health|mcp|mcp-tools|api)(\/|$)/,
})
