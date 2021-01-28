const LottoBuffalo = artifacts.require('LottoBuffalo')
const RandomNumberConsumer = artifacts.require('RandomNumberConsumer')

module.exports = async callback => {
  try {
    const lotto = await LottoBuffalo.deployed()
    const random = await RandomNumberConsumer.deployed()


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

		let _lotteryAmount = await lotto.getLotteryAmount()
		console.log(`Lottery Amount: ${_lotteryAmount}`)

		let _alarmAddress = await lotto.getAlarmAddress()
		console.log(`Alarm Address: ${_alarmAddress}`)

		let _alarmJobId = await lotto.getAlarmJobId()
		console.log(`Alarm Job Id: ${_alarmJobId}`)

		let _randomResult = await lotto.RANDOMRESULT.call()
		console.log(`Random Result: ${_randomResult}`)

		let _lottoLINKbalance = await lotto.getLINKbalance()
		console.log('_lottoLINKbalance: $(_lottoLINKbalance')

		let _randomLINKbalance = await random.getLINKbalance()
		console.log('_randomLINKbalance: $(_randomLINKbalance')

    callback()
	}
	catch (err) {
    callback(err)
  }
}
