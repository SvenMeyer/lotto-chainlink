const LinkTokenInterface = artifacts.require('LinkTokenInterface')
const Lottery = artifacts.require('Lottery')
const RandomNumberConsumer = artifacts.require('RandomNumberConsumer')

module.exports = async callback => {
  try {
    const lottery = await Lottery.deployed()
    const random = await RandomNumberConsumer.deployed()

    const linkTokenAddress = await lottery.getChainlinkToken()
    console.log("linkTokenAddress:", linkTokenAddress);
    const linkToken = await LinkTokenInterface.at(linkTokenAddress)


		let _id = await lottery.id.call()
		console.log(`id: ${_id}`)

		let _isOpen = await lottery.isOpen()
		console.log(`Stage.open: ${_isOpen}`)

		let _isClosed = await lottery.isClosed()
		console.log(`Stage.closed: ${_isClosed}`)

		let _isFinished = await lottery.isFinished()
		console.log(`Stage.finished: ${_isFinished}`)

		let _playerCount = await lottery.getPlayerCount()
		console.log(`Player Count: ${_playerCount}`)

		let _players = await lottery.getPlayers()
		console.log(`Players: `, _players)

		let _alarmAddress = await lottery.getAlarmAddress()
		console.log(`Alarm Address: ${_alarmAddress}`)

		let _alarmJobId = await lottery.getAlarmJobId()
		console.log(`Alarm Job Id: ${_alarmJobId}`)

		let _randomResult = await lottery.lastRandom.call()
		console.log(`Random Result: ${_randomResult}`)

		let _lotteryAmount = await lottery.getLotteryAmount()
    console.log(`Lottery Amount: ${_lotteryAmount}`)

    const decimals = await linkToken.decimals();

    const lotteryLINKbalance = await linkToken.balanceOf(lottery.address)
    console.log('lotteryLINKbalance: ', lotteryLINKbalance / (10 ** decimals), "LINK");

    const randomLINKbalance = await linkToken.balanceOf(random.address)
    console.log('randomLINKbalance : ', randomLINKbalance / (10 ** decimals) , "LINK");

    callback()
	}
	catch (err) {
    callback(err)
  }
}
