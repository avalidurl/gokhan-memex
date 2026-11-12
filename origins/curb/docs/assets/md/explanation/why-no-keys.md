# Why no keys

The hub never holds upstream LLM API keys.

* Sellers keep keys on **their** inference stack.
* Buyers pay on-chain, then call the **seller endpoint** with the grant.
* Compromise of the hub does not dump a pool of provider credentials.
* The rail stays a matcher + x402 coordinator, not a proxy LLM SaaS.

If you need the hub to "just call the model for you," that is a different product. CURB deliberately does not.
