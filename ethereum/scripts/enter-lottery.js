// npx truffle exec scripts/enter-lottery.js --network kovan

const LottoBuffalo = artifacts.require('LottoBuffalo')

const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
const { Oracle } = require('@chainlink/contracts/truffle/v0.6/Oracle')
// const { VRFCoordinator } = require('@chainlink/contracts/truffle/v0.6/VRFCoordinator')

const truffle_config = require('../truffle-config.js');

/*
  This script makes it easy to read the data variable
  of the requesting contract.
*/

module.exports = async callback => {

  try {

    const networkId = await web3.eth.net.getId();
    console.log("networkId =", networkId);

    const networkIdName = {
       1: 'mainnet',
       3: 'ropsten',
       4: 'rinkeby',
       5: 'goerli',
      42: "kovan",
    5777: 'development'  // Ganache
    }

    const network = networkIdName[networkId];

    console.log("network   =", network);

    const network_config = truffle_config.networks[network];

    const Address = {
      LINK:   network_config.LINK,
      VRF:    network_config.VRF_COORDINATOR,
      ORACLE: network_config.ALARM_ORACLE
    }

    console.log(Address);

    // console.log("web3.eth", web3.eth);
    // console.log("web3.currentProvider=", web3.currentProvider);

    Oracle.setProvider(web3.eth.currentProvider)
    LinkToken.setProvider(web3.eth.currentProvider)

    const [defaultAccount, ...players] = await web3.eth.getAccounts()
    const lotto = await LottoBuffalo.deployed()
    // const oracle = await Oracle.at('0x8886DB5440147798D27E8AB9c9090140b5cEcA47')
    const linkToken = await LinkToken.at(Address.LINK)

    // let isAuthorized = await oracle.getAuthorizationStatus(Address.VRF)
    let linkAmount = await linkToken.balanceOf(lotto.address)

    console.log('LottoBuffalo Address: ', lotto.address)
    console.log(`LottoBuffalo LINK: ${linkAmount}`)
    // console.log('VRF isAuthorized: ', isAuthorized)

    // await oracle.setFulfillmentPermission(Address.VRF, true, { from: defaultAccount })

    // isAuthorized = await oracle.getAuthorizationStatus(Address.VRF)
    // console.log('VRF isAuthorized: ', isAuthorized)

    const display = async () => {
      let _id = await lotto.id.call()
      let _isOpen = await lotto.isOpen()
      let _isClosed = await lotto.isClosed()
      let _isFinished = await lotto.isFinished()
      let _playerCount = await lotto.getPlayerCount()
      let _players = await lotto.getPlayers()
      let _lotteryAmount = await lotto.getLotteryAmount()
      let _alarmAddress = await lotto.getAlarmAddress()
      let _alarmJobId = await lotto.getAlarmJobId()

      console.log(`id: ${_id}`)
      console.log(`Stage.open: ${_isOpen}`)
      console.log(`Stage.closed: ${_isClosed}`)
      console.log(`Stage.finished: ${_isFinished}`)
      console.log(`Player Count: ${_playerCount}`)
      console.log(`Players: `, _players)
      console.log(`Lottery Amount: ${_lotteryAmount}`)
      console.log(`Alarm Address: ${_alarmAddress}`)
      console.log(`Alarm Job Id: ${_alarmJobId}`)
    }

    await display()

    const isOpen = await lotto.isOpen()

    if (!isOpen) {
      console.log('Opening lottery!')
      const open_tx = await lotto.open(300)
      console.log('Open Logs: ', open_tx.logs)
    }

    const tx_default_join = await lotto.join({ from: defaultAccount, value: 1000000000000000 })
    await Promise.all(players.map(async from => await lotto.join({ from, value: 1000000000000000 })))

    console.log(tx_default_join)
    await display()

    callback()
  } catch (err) {
    callback(err)
  }
}
