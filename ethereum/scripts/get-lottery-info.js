const LinkTokenInterface = artifacts.require('LinkTokenInterface')
const LottoBuffalo = artifacts.require('LottoBuffalo')
const RandomNumberConsumer = artifacts.require('RandomNumberConsumer')

module.exports = async callback => {
  try {
    const lotto = await LottoBuffalo.deployed()
    const random = await RandomNumberConsumer.deployed()

    const linkTokenAddress = await lotto.getChainlinkToken()
    console.log("linkTokenAddress:", linkTokenAddress);
    const linkToken = await LinkTokenInterface.at(linkTokenAddress)


		let _id = await lotto.id.call()
		console.log(`id: ${_id}`)

		let _isOpen = await lotto.isOpen()
		console.log(`Stage.open: ${_isOpen}`)

		let _isClosed = await lotto.isClosed()
		console.log(`Stage.closed: ${_isClosed}`)

		let _isFinished = await lotto.isFinished()
		console.log(`Stage.finished: ${_isFinished}`)

		let _playerCount = await lotto.getPlayerCount()
		console.log(`Player Count: ${_playerCount}`)

		let _players = await lotto.getPlayers()
		console.log(`Players: `, _players)

		let _alarmAddress = await lotto.getAlarmAddress()
		console.log(`Alarm Address: ${_alarmAddress}`)

		let _alarmJobId = await lotto.getAlarmJobId()
		console.log(`Alarm Job Id: ${_alarmJobId}`)

		let _randomResult = await lotto.RANDOMRESULT.call()
		console.log(`Random Result: ${_randomResult}`)

		let _lotteryAmount = await lotto.getLotteryAmount()
    console.log(`Lottery Amount: ${_lotteryAmount}`)

    const lottoLINKbalance = await linkToken.balanceOf(lotto.address)
    console.log('lottoLINKbalance: ', lottoLINKbalance / (10**18) , "LINK");

    const randomLINKbalance = await linkToken.balanceOf(random.address)
    console.log('randomLINKbalance: ', parseInt(randomLINKbalance.toString()) / (10**18) , "LINK");

    callback()
	}
	catch (err) {
    callback(err)
  }
}
