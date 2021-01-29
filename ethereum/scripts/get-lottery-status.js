const Lottery = artifacts.require('LottoBuffalo')
const RandomNumberConsumer = artifacts.require('RandomNumberConsumer')

module.exports = async callback => {
  try {
    const lottery = await Lottery.deployed()
    const random  = await RandomNumberConsumer.deployed()

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

    let _randomResult = await lottery.RANDOMRESULT.call()
    console.log(`Random Result: ${_randomResult}`)

    callback()
	}
	catch (err) {
    callback(err)
  }
}
