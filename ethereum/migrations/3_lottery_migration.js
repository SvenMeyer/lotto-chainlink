const { LinkToken }      = require('@chainlink/contracts/truffle/v0.4/LinkToken')
const { Oracle }         = require('@chainlink/contracts/truffle/v0.6/Oracle')
const { VRFCoordinator } = require('@chainlink/contracts/truffle/v0.6/VRFCoordinator')

const Lottery = artifacts.require('Lottery')
const LotteryGovernance = artifacts.require('LotteryGovernance')
const RandomNumberConsumer = artifacts.require('RandomNumberConsumer')

const truffle_config = require('../truffle-config.js');

module.exports = async (deployer, network, [defaultAccount]) => {

  const network_config = truffle_config.networks[network];
  console.log("network_config =", network_config);

  var Address = {
    LINK: network_config.LINK,
    ORACLE: network_config.ALARM_ORACLE,
    VRF_COORDINATOR: network_config.VRF_COORDINATOR
  };

  // Local (development) networks need their own deployment of the LINK
  // token and the Oracle contract
  if (network.startsWith('ganache') ||
    network.startsWith('dev')     ||
    network.startsWith('local')   ||
    network.startsWith('cldev') ) {
    try {
      LinkToken.setProvider(deployer.provider)
      Oracle.setProvider(deployer.provider)
      VRFCoordinator.setProvider(deployer.provider)

      const _linkToken = await LinkToken.deployed()
      Address.LINK = _linkToken.address

      const _oracle = await Oracle.deployed()
      Address.ORACLE = _oracle.address

      const _vrfCoordinator = await VRFCoordinator.deployed()
      Address.VRF_COORDINATOR = _vrfCoordinator.address
    } catch (err) {
      console.error(err)
    }
  }

  console.log(Address);

  // *TODO* use these parameter for contract constructor as well
  // network_config.ALARM_JOB_ID_HEX  // this one is tricky - it is a String not a Hex number !!
  // network_config.ALARM_FEE

  try {
    await deployer.deploy(LotteryGovernance, { from: defaultAccount } )

    const _lotteryGovernance = await LotteryGovernance.deployed();
    console.log("_lotteryGovernance.address =", _lotteryGovernance.address);

    await deployer.deploy(Lottery,
      _lotteryGovernance.address,
      Address.LINK,
      Address.ORACLE,
      { from: defaultAccount }
    )

    const _lottery = await Lottery.deployed();
    console.log("_lottery.address =", _lottery.address);

    await deployer.deploy(RandomNumberConsumer,
      Address.VRF_COORDINATOR,
      Address.LINK,
      _lotteryGovernance.address,
      network_config.VRF_KEYHASH,
      network_config.VRF_FEE,
      { from: defaultAccount }
    )

    const _randomNumberConsumer = await RandomNumberConsumer.deployed();
    console.log("_randomNumberConsumer.address =", _randomNumberConsumer.address);

    await _lotteryGovernance.init(_lottery.address, _randomNumberConsumer.address)
  }
  catch (err) {
    console.error(err)
  }
}
