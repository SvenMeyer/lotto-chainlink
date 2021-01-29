const Lottery = artifacts.require('Lottery')

module.exports = async callback => {
  try {
    const lotto = await Lottery.deployed()
    const amount = await lotto.getLotteryAmount()
    console.log(`Lottery Amount: ${amount}`)
    callback()
  } catch (err) {
    callback(err)
  }
}