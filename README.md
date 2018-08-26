# Speed Checkers

## Ever wanted to challenge others to a modified version of checkers entirely on the Ethereum blockchain? No? Did I mention ETH is on the line? Still no? Well you can anyway!

## Introducing Speed Checkers

### Rules

The rules are the exact same as regualar checkers, except jumps aren't mandatory and to win you simply need to get one of your pieces to the other end of the board. Placing a wager is optional.

If you're not already familiar with the rules of checkers, don't worry they're very simple. You can find many resourses online.

### Stack

* Solidity to write the smart contracts
* NPM / truffle / ganache for a development workflow & environment
* React to build the UI 
* Drizzle to keep the UI in sync with the smart contract state

## Run locally

### Requirements
- nodejs (v8.0.0 or above)
- npm
- truffle
- ganache-cli
- A C++ compiler
- Python 2

### Clone the repo

`git clone git@github.com:liamaharon/speed-checkers-dapp.git && cd speed-checkers-dapp`

### Install deps

`npm install`

### Fire up a development blockchain

`npm run chain`

### Compile & deploy the smart contracts

`truffle compile && truffle migrate`

### Serve front-end

`npm run start`

### Play around

Visit `localhost:3000` and configure Metamask to read from `localhost:8545`
