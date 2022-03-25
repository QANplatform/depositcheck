# Simple deposit transaction checker

This tools shows examples how to check on Centralized Exchanges whether a transaction is a valid deposit or not.
The issue mitigation logic starts [in index.js on line 47](https://github.com/QANplatform/depositcheck/blob/main/app/index.js#L47).

## How to run

```sh
docker run --rm qanplatform/depositcheck [eth|bsc] $TXHASH
```

## Example

```
docker run --rm qanplatform/depositcheck eth 0xe58b406073dbccd09de43c278ec7d6f40eaba86d60c68c8c79ff784bc34ef9dc
```

# Threat assessment

This description assesses the threat related to a possible double-crediting attack which some centralized exchanges might be vulnerable to, depending on the completeness of integrity checks they conduct on token deposits.

## Exploitable vulnerability

The vulnerability is exploitable only if a given exchange does only check the **beneficiary** of an ERC20 compliant ```Transfer(sender, beneficiary, amount)``` event and does not check the **sender**.

This means that if the **sender** and **beneficiary** are the same in any emitted ```Transfer(sender, beneficiary, amount)``` event, then the malicious attacker could gain multiple deposits to his account on the centralized exchange, since the amount is not deducted from the **sender** (which also happens to be him), just simply credited to the **beneficiary**.

## Attack vectors

### Double crediting

**Threat model:** The attackers can gain a financial benefit for themselves.

### Locked token depositing

**Threat model:** The attackers can cause financial loss for the exchange.

## Mitigations

### Double crediting

Check all parameters of the emitted ```Transfer(sender, beneficiary, amount)```. If sender and beneficiary parameters are the same, simply ignore the event, since it equals a zero sum transaction for a given wallet address.

[> CODE SAMPLE <](https://github.com/QANplatform/depositcheck/blob/main/app/index.js#L47)

### Locked token depositing

Check the function identifier of the deposit transaction. There are two approaches here:

#### Option 1:

If the ```Transfer(sender, beneficiary, amount)``` event is NOT emitted from an ERC20 standard function (either ```transfer(address, uint256)``` or ```transferFrom(address, address, uint256)```), simply ignore the transaction.

[> CODE SAMPLE <](https://github.com/QANplatform/depositcheck/blob/main/app/index.js#L54)

#### Option 2:

If the ```Transfer(sender, beneficiary, amount)``` event is emitted from QANX's ```transferLocked(address, uint256, uint32, uint32, uint8)``` function, simply ignore the transaction.

[> CODE SAMPLE <](https://github.com/QANplatform/depositcheck/blob/main/app/index.js#L60)
