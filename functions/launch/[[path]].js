import { originOnRequest } from '../../pages-lib/estate-proxy.js'
export const onRequest = originOnRequest({
  prefix: '/launch',
  host: 'launch.numetal.xyz',
  name: 'Launch',
  api: /^\/(api|telegram|mcp|openapi\.json|llms\.txt|skill\.md|\.well-known)(\/|$)/,
})
