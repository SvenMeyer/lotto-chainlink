# Lottery using Chainlink VRF

## Requirements

- npm / yarn

## Installation

```bash
npm install
```

Or

```bash
yarn install
```

## Quick Start

Deploment should work on all networks as long as the right parameter are provided in `truffle-config.js`.
Please check the scripts if they might need some adjustments as well.
This version should work on kovan out of the box.

A local install needs much more work, see some guidance further below.

```bash
rm -rf build/contracts/
truffle compile --all
truffle migrate --network kovan --reset

truffle exex --network kovan scripts/fund-contract.js

truffle exex --network kovan scripts/enter-lottery.js

truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
```
