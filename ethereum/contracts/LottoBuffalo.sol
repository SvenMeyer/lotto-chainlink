// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
// import "openzeppelin-solidity/contracts/access/Ownable.sol";
// import "openzeppelin-solidity/contracts/utils/EnumerableSet.sol";

import {Governance} from "./interfaces/Governance.sol";
import {Randomness} from "./interfaces/Randomness.sol";

/**
 * @title MyContract is an example contract which requests data from
 * the Chainlink network
 * @dev This contract is designed to work on multiple networks, including
 * local test networks
 */

contract LottoBuffalo is ChainlinkClient, Ownable {

    using EnumerableSet for EnumerableSet.AddressSet;

    struct GameHistory {
        // Feasible to play more than 4,294,967,295 games?
        uint32 played;
    }

    struct Player {
        uint256 id;
        GameHistory gameHistory;
    }

    enum Stages {OPEN, CLOSED, FINISHED}

    address payable[] public players;
    mapping(address => uint256) playerIdsByAddress;

    Governance public governance;
    // .01 ETH
    uint256 public MINIMUM = 1000000000000000;
    // 0.1 LINK
    uint256 public ORACLE_PAYMENT = 1000000000000000000;
    // Alarm stuff
    address private CHAINLINK_ALARM_ORACLE;

    // *TODO * hard coded for kovan as this is tricky , its a String not a Hex number !
    bytes32 private CHAINLINK_ALARM_JOB_ID = "a7ab70d561d34eb49e9b1612fd2e044b";
    // bytes32 private CHAINLINK_ALARM_JOB_ID = "778633ef18884692adc1fe9592107957";

    // VRF stuff
    // bytes32 internal _keyHash;
    uint256 public RANDOMRESULT;

    /**
     * The current lottery id.
     */
    uint256 public id = 0;

    uint256 public data;

    Stages private stage;

    event Open(uint256 _id, address indexed _from, uint256 _durationInSeconds);
    event Close(uint256 _id);
    event Winner(
        uint256 _id,
        uint256 _randomness,
        uint256 _index,
        address indexed _from,
        uint256 _amount
    );
    event PlayerJoined(uint256 _id, address indexed _from);

    modifier atStage(Stages _stage) {
        // string(abi.encodePacked(_.name, " can only be called at stage: ", _stage, "\n Current stage: ", stage))
        require(stage == _stage, "Function cannot be called at this time.");
        _;
    }

    /**
     * @notice Deploy the contract with a specified address for the LINK
     * and Oracle contract addresses
     * @dev Sets the storage for the specified addresses
     * @param _link The address of the LINK token contract
     */
    constructor(
        address _governance,
        address _link,
        address _alarmOracle
    ) public {
        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }

        governance = Governance(_governance);
        id = 1;
        stage = Stages.CLOSED;

        CHAINLINK_ALARM_ORACLE = _alarmOracle;
    }

    function join() public payable atStage(Stages.OPEN) {
        // assert(msg.value == MINIMUM);    *TEST* let allow users to join for free
        players.push(msg.sender);
        // TODO: check that player is not already in lottery
        emit PlayerJoined(id, msg.sender);
    }

    /**
     * Opens the lottery allowing players to join.
     *
     * Sends a request to the Chainlink alarm oracle that will automatically
     * close the lottery after durationInSeconds passed.
     *
     * @notice only the owner/deployer of the contract can call this function
     * @param durationInSeconds the length in seconds the lottery will be open.
     */
    function open(uint256 durationInSeconds) public onlyOwner atStage(Stages.CLOSED) {
        Chainlink.Request memory req = buildChainlinkRequest(
            CHAINLINK_ALARM_JOB_ID,
            address(this),
            this.fulfillAlarm.selector
        );

        req.addUint("until", block.timestamp + durationInSeconds);
        sendChainlinkRequestTo(CHAINLINK_ALARM_ORACLE, req, ORACLE_PAYMENT);
        stage = Stages.OPEN;
        emit Open(id, msg.sender, durationInSeconds);
    }

    // function fulfillAlarm(bytes32 _requestId, uint256 _volume) public recordChainlinkFulfillment(_requestId)
    function fulfillAlarm(bytes32 requestId)
        public
        atStage(Stages.OPEN)
        recordChainlinkFulfillment(requestId)
    {
        // TODO: add a require here so that only the oracle contract can
        // call the fulfill alarm method
        stage = Stages.FINISHED;
        Randomness(governance.randomness()).getLotteryNumber(id, id);
        id = id + 1;
    }

    function close(uint256 randomness) external atStage(Stages.FINISHED) {
        require(randomness > 0, "random-not-found");

        uint256 index = randomness % players.length;
        uint256 amount = address(this).balance;
        // all units of transfer are in wei
        players[index].transfer(amount);
        emit Winner(id, randomness, index, players[index], amount);
        // reset players
        // TODO: reset lobbies/groups rather than players
        players = new address payable[](0);
        stage = Stages.CLOSED;
        emit Close(id);
        // open(5 minutes);
    }

    /**
     * @notice Returns the address of the LINK token
     * @dev This is the public implementation for chainlinkTokenAddress, which is
     * an internal method of the ChainlinkClient contract
     */
    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function getPlayer(address _player) public view returns (address payable) {
        uint256 _playerId = playerIdsByAddress[_player];
        return players[_playerId];
    }

    function getAlarmAddress() public view returns (address) {
        return CHAINLINK_ALARM_ORACLE;
    }

    function getAlarmJobId() public view returns (bytes32) {
        return CHAINLINK_ALARM_JOB_ID;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function getPlayerCount() public view returns (uint256) {
        return players.length;
    }

    function getLotteryAmount() public view returns (uint256) {
        return address(this).balance;
    }

    function isOpen() public view returns (bool) {
        return stage == Stages.OPEN;
    }

    function isClosed() public view returns (bool) {
        return stage == Stages.CLOSED;
    }

    function isFinished() public view returns (bool) {
        return stage == Stages.FINISHED;
    }

    function getStage() public view returns (Stages) {
        return stage;
    }

    function setStage(Stages _stage) external onlyOwner {
        stage = _stage;
    }

    /**
     * Withdraw LINK from this contract
     *
     * NOTE: DO NOT USE THIS IN PRODUCTION AS IT CAN BE CALLED BY ANY ADDRESS.
     * THIS IS PURELY FOR EXAMPLE PURPOSES ONLY.
     */
    function withdrawLink() external onlyOwner {
        LinkTokenInterface linkToken = LinkTokenInterface(chainlinkTokenAddress());
        require(linkToken.transfer(msg.sender, linkToken.balanceOf(address(this))), "Unable to transfer");
    }
}
