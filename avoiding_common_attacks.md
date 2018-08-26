# Avoiding common attacks

## Unit tests

Unit tests are a great way to ensure contract functions behave as expected as changes are made. This in turn reduces the likelyhood of logic bugs, which could open up attack vectors

## Overflow

A SafeMath library is used where possible to eliminate the possibility of unintended integer overflow

## Poison data

User input is verified with require() statements to reduce the possibilty of unexpected input causing unexpected behavior

## Malicious admin

The contract administrator's power is limited to pausing the contract and allowing emergency withdrawals. They have no ability to access or prevent access to user funds

## Gas limits

Nowhere in the contract are arrays of undetermined length looped over, to reduce the possibility of unexpectedly high gas costs