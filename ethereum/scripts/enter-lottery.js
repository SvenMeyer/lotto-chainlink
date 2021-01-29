// npx truffle exec scripts/enter-lottery.js --network kovan

const Lottery = artifacts.require('Lottery')

const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
const { Oracle }    = require('@chainlink/contracts/truffle/v0.6/Oracle')

const truffle_config = require('../truffle-config.js');

const duration = 300; // duration the lottery is open in seconds

module.exports = async callback => {

  try {

    const networkId = await web3.eth.net.getId();
    console.log("networkId =", networkId);

    const networkIdName = {
       1: 'mainnet',     // live
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

    const accounts = await web3.eth.getAccounts();
    [defaultAccount, player_1, player_2, ...players] = accounts;

    console.log("defaultAccount =", defaultAccount);

    const lotto = await Lottery.deployed()
    // const oracle = await Oracle.at('0x8886DB5440147798D27E8AB9c9090140b5cEcA47')
    const linkToken = await LinkToken.at(Address.LINK)

    // let isAuthorized = await oracle.getAuthorizationStatus(Address.VRF)
    let linkAmount = await linkToken.balanceOf(lotto.address)

    console.log('Lottery Address: ', lotto.address)
    console.log(`Lottery LINK: ${linkAmount}`)
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
      console.log('>>>>>>>>>> Opening lottery ! <<<<<<<<<<')
      console.log('the lottery duration will be', duration, 'seconds')
      const open_tx = await lotto.open(duration)
      console.log('open_tx.logs: ', open_tx.logs)
    }
    else {
      console.log("The lottery is not open !")
    }

    for (i=0; i<3; i++) {
      console.log("player", i , "to join);")
      let tx_join = await lotto.join({ from: accounts[i] }) // , value: 1000000000000000 })
      console.log(tx_join)
    }

    // await Promise.all(players.map(async from => await lotto.join({ from, value: 1000000000000000 })))

    await display()

    callback()
  }
  catch (err) {
    callback(err)
  }
}
