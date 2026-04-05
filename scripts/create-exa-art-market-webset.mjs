#!/usr/bin/env node

/**
 * Create a first-pass art-market Webset in Exa.
 *
 * Usage:
 *   set -a; source /Users/gokhanturhan/GitHub/gokhan-memex/.env; set +a
 *   node scripts/create-exa-art-market-webset.mjs
 *
 * Optional env vars:
 *   EXA_API_KEY      Required
 *   WEBSET_QUERY     Search query override
 *   WEBSET_COUNT     Number of results to target (default: 25)
 *   WEBSET_NAME      Dataset name override
 */

const apiKey = process.env.EXA_API_KEY;
if (!apiKey) {
  console.error('EXA_API_KEY is missing.');
  process.exit(1);
}

const query =
  process.env.WEBSET_QUERY ??
  'art market intelligence: galleries, auction houses, fairs, and museum exhibitions in 2025';
const count = Number.parseInt(process.env.WEBSET_COUNT ?? '25', 10);
const name = process.env.WEBSET_NAME ?? 'art-market-intel-v1';

const payload = {
  search: {
    query,
    count,
    entity: {
      type: 'custom',
    },
    criteria: [
      {
        description:
          'The result is related to the art market, including galleries, auction houses, fairs, museums, exhibitions, artists, or sales activity.',
      },
      {
        description:
          'Prefer results with public, structured information such as names, dates, locations, prices, or venue details.',
      },
    ],
    recall: true,
  },
  metadata: {
    name,
    description:
      'First-pass art market intelligence dataset from public web sources.',
  },
};

const response = await fetch('https://api.exa.ai/websets/v0/websets', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': apiKey,
  },
  body: JSON.stringify(payload),
});

const text = await response.text();

if (!response.ok) {
  console.error(`Exa request failed with ${response.status}`);
  console.error(text);
  process.exit(response.status);
}

let data;
try {
  data = JSON.parse(text);
} catch {
  data = text;
}

console.log(JSON.stringify(data, null, 2));
