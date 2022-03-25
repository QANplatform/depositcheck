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
