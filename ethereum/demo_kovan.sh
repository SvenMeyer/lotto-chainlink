clear
rm -rf build/contracts/
truffle compile --all | grep -v 'SPDX-License'

truffle migrate --network kovan --reset | grep -v 'SPDX-License'

truffle exex --network kovan scripts/fund-contract.js

truffle exex --network kovan scripts/enter-lottery.js

truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
truffle exex --network kovan scripts/get-lottery-info.js
