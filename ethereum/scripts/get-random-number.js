const RandomNumberConsumer = artifacts.require('RandomNumberConsumer')

module.exports = async callback => {
  try {
    const randomNumberConsumer = await RandomNumberConsumer.deployed()
    const r = await randomNumberConsumer.getRandomNumber.call('0x5eed')
    callback(r)
  } catch (err) {
    callback(r)
  }
}