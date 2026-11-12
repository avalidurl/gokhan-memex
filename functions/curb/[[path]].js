import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/curb',
  host: 'curb.numetal.xyz',
  name: 'CURB',
  api: /^\/(api|v1|health|mcp|skill\.md|openapi\.json|llms\.txt|\.well-known)(\/|$)/,
})
