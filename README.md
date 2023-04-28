# Simple deposit transaction checker

This tool shows how to check whether a transaction transfers locked QANX tokens or not.
The issue mitigation logic is [in index.js on line 44](https://github.com/QANplatform/depositcheck/blob/main/app/index.js#L44).

## How to run

```sh
docker run --rm qanplatform/depositcheck [eth|bsc] $TXHASH
```

## Example

```
docker run --rm qanplatform/depositcheck eth 0x9dd3bd166f7c56a097e32576d59d35be83c9914bbca67f56a17dbe77d1024d62
```

## Threat assessment: Locked token depositing

A malicious user could send locked tokens to a centralized exchange, which might not be withdrawable immediately.
It is important to note that there is no financial gain in this type of activity for any malicious attacker, it only costs them additional money, so game-theory wise it is not feasible.

Anyway, to prevent this from happening, an additional check [consisting of a single line of code](https://github.com/QANplatform/depositcheck/blob/main/app/index.js#L44) must be added to 100% prevent this from happening.
