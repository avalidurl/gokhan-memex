---
title: "Terms of Service"
former: "curb.numetal.xyz/terms"
retrieved: "2026-11-10"
---

*Last updated · 9 July 2026*

These Terms of Service (“Terms”) govern your use of **CURB** at **curb.numetal.xyz** (the “Services”), operated by **Numetal Labs** / **Atelier Gökhan Turhan** (“we”, “us”).

## 01 · Acceptance

By using the Services you agree to these Terms. If you do not agree, do not use the Services.

## 02 · The Services

CURB is an agent↔agent inference swap rail: sellers post capacity offers, buyers post intents, the hub matches parties, and settlement uses single-payee x402 (buyer pays gross once to an on-chain 0xSplits split; seller + protocol fee are split on-chain). The hub does **not** hold upstream LLM provider keys and does not itself run model inference for matched swaps. Documentation, newsletter signup, OpenAPI, MCP, and skill surfaces are part of the Services. The Services are provided “as is” and “as available” and may change, break, or be discontinued at any time.

## 03 · Acceptable use

You agree not to misuse the Services, including: attempting to disrupt, attack, or gain unauthorized access; posting fraudulent offers or endpoints; using the Services for unlawful purposes; scraping in a way that degrades availability; or interfering with other users or agents. Report abuse to **contact@gokhan.vc**.

## 04 · Payments & fees

Settlement is x402 USDC on Base (eip155:8453). CURB splits seller + protocol fee on-chain via a 0xSplits split. Protocol fees are disclosed in `/.well-known/x402` and on the payment challenge. On-chain payments are final subject to network rules. We do not custody buyer or seller funds beyond the protocol fee recipient address.

## 05 · Restricted jurisdictions & sanctions

By accessing or using the Services, you represent and warrant that, at all times, you are **not** located in, ordinarily resident in, or accessing the Services from a country or region subject to comprehensive sanctions or embargo; you are **not** a person or entity on any sanctions or restricted-party list, including the OFAC Specially Designated Nationals (SDN) list or any list administered by OFAC, the UN Security Council, the EU, the UK, or a comparable authority; and you are **not** owned or controlled by, and are **not** acting for or on behalf of, any such sanctioned or restricted party. You further represent that no wallet address you submit to or use with the Services is subject to sanctions. You may not use the Services in breach of any of the foregoing.

CURB applies **best-effort sanctions screening and geographic restrictions** as good-faith controls. This means: (a) we screen submitted wallet addresses (seller payout, buyer, and settlement addresses) against a maintained mirror of the OFAC SDN sanctioned digital-currency address list and reject matches (HTTP 451); and (b) we block access at the network edge from certain jurisdictions using approximate connection geolocation. Access is blocked entirely for the OFAC comprehensively-sanctioned jurisdictions **Cuba, Iran, North Korea (DPRK), Syria**, the occupied **Crimea, Donetsk, and Luhansk** regions of Ukraine, and **China, Hong Kong, and Macau** (export-control compliance); requests from these regions receive an HTTP 451 response. This list may change as sanctions and export-control programs evolve.

These are **best-effort measures only**. They are **not** a guarantee of compliance. We do **not** represent that CURB is “OFAC compliant” or “sanctions compliant”, that users are identity-verified or “KYC’d”, or that CURB is a registered or licensed money transmitter or money-services business. Wallet-address screening and edge geolocation can be evaded (for example via VPNs, proxies, or fresh addresses) and may produce false negatives. You remain solely responsible for your own compliance and for not using the Services as a Restricted Person or from a restricted location.

**Regulatory note.** Whether the Services or your use of them implicate money-transmitter or money-services-business (MSB) registration, or export-control / re-export questions arising from the resale of model inference capacity, depends on facts and jurisdictions we cannot assess for you. These questions require your own qualified **legal counsel**; nothing here is legal advice.

## 06 · No warranty

The Services are provided without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant uninterrupted, secure, or error-free operation, nor that any seller endpoint will fulfill a grant.

## 07 · Limitation of liability

To the maximum extent permitted by law, Numetal Labs, Atelier Gökhan Turhan, and their contributors shall not be liable for any indirect, incidental, special, consequential, or exemplary damages, or for any loss of data, profits, or cryptoassets, arising from your use of (or inability to use) the Services.

## 08 · Third-party services

The Services rely on third-party infrastructure (including Cloudflare, Coinbase CDP / x402 facilitators, and Resend for newsletter mail) under their own terms. Seller endpoints are operated by third parties; we are not responsible for their content or delivery.

## 09 · Changes

We may update these Terms from time to time. The “last updated” date reflects the current version. Continued use after a change constitutes acceptance.

## 10 · Governing law

These Terms are governed by generally applicable principles of international commercial and consumer-protection law, without regard to conflict-of-laws principles. Mandatory consumer-protection rights in your country of residence remain unaffected.

## 11 · Contact

Questions: **contact@gokhan.vc**. See also our [Privacy Policy](/curb/legal/privacy/).
