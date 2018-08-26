# Design pattern decisions

## Withdrawal pattern

To isolate the damage a malicious actor could cause by deliberately influencing their withdrawals to fail, the withdrawal pattern is used to split withdrawals into a 2 step process:

- On game completion winner is decided (no funds are touched)
- Winner calls a function to withdraw their winnings

## Access restriction

The OpenZepplin owned.Sol implementation restricts the ability to call restricted functions, and custom modifiers are used to ensure only players of a game are able to access their game.

## State machine

Every Game in the SpeedCheckers is a state machine, with defined _stages_ where it behaves differently. For example, during the _WaitingForPlayer_ state the only logic the Game will allow is a second player joining the game.

Possible states for Game, in order of natural flow:

- WaitingForPlayer
- Underway
- PendingWithdrawal
- Finished
