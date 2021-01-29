// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

import {GovernanceInterface} from "./interfaces/GovernanceInterface.sol";
import {RandomnessInterface} from "./interfaces/RandomnessInterface.sol";

/**
 * @title MyContract is an example contract which requests data from
 * the Chainlink network
 * @dev This contract is designed to work on multiple networks, including
 * local test networks
 */

contract Lottery is ChainlinkClient, Ownable {

    GovernanceInterface public governance;

    // log main events of Lottery
    Chainlink.Request public alarmRequest;
    uint256 public alarmStartTime;
    uint256 public alarmSetTime;
    uint256 public alarmReceivedTime;
    bytes32 public alarmRequestId;

    uint256 public lastRandom;

    using EnumerableSet for EnumerableSet.AddressSet;

    struct GameHistory {
        uint256 played;
    }

    struct Player {
        uint256 id;
        GameHistory gameHistory;
    }

    enum Stages {
        OPEN,
        CLOSED,
        FINISHED,
        RANDOM_REQUEST_SENT,
        RANDOM_PROCESSED,
        WINNER_PAID
    }

    Stages public stage;

    address payable[] public players;
    mapping(address => uint256) playerIdsByAddress;  // do we need this ? *TODO*

    uint256 public MINIMUM = 1000000000000000;  // .01 ETH - we will make joining free - *TODO* remove

    // parameter for Chainlink Alarm Oracle
    uint256 public  ORACLE_PAYMENT;          // 100000000000000000;  // 0.1 LINK
    address private CHAINLINK_ALARM_ORACLE;
    bytes32 private CHAINLINK_ALARM_JOB_ID;  // String (!) for kovan "a7ab70d561d34eb49e9b1612fd2e044b";

    /**
     * The current lottery id.
     */
    uint256 public id = 0;


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
        address _alarmOracle,
        uint256 _alarmFee,
        bytes32 _alarmJobIdHex  // Job Id String converted to Hex !!!
    ) public {
        governance = GovernanceInterface(_governance);

        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }

        CHAINLINK_ALARM_ORACLE = _alarmOracle;
        CHAINLINK_ALARM_JOB_ID = _alarmJobIdHex;  // String (!) for Kovan "a7ab70d561d34eb49e9b1612fd2e044b"
        ORACLE_PAYMENT         = _alarmFee;

        id = 1;
        stage = Stages.CLOSED;
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
    function open_OLD(uint256 durationInSeconds) public onlyOwner atStage(Stages.CLOSED) {
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


    function open(uint256 durationInSeconds) public onlyOwner atStage(Stages.CLOSED) returns (bytes32 requestId) {

        Chainlink.Request memory request = buildChainlinkRequest(CHAINLINK_ALARM_JOB_ID, address(this), this.fulfillAlarm.selector);

        alarmStartTime = block.timestamp;
        alarmSetTime   = alarmStartTime + durationInSeconds;
        request.addUint("until", alarmSetTime);

        alarmRequest = request; // store for *TEST*

        requestId = sendChainlinkRequestTo(CHAINLINK_ALARM_ORACLE, request, ORACLE_PAYMENT);

        alarmRequestId = requestId; // store for *TEST*

        stage = Stages.OPEN;
        emit Open(id, msg.sender, durationInSeconds);

        return requestId;
    }


    function join() public payable atStage(Stages.OPEN) {
        // assert(msg.value == MINIMUM);    *TEST* let users join for free (if they want)
        players.push(msg.sender);
        // TODO: check that player is not already in lottery
        emit PlayerJoined(id, msg.sender);
    }


    function fulfillAlarm(bytes32 requestId) public atStage(Stages.OPEN) recordChainlinkFulfillment(requestId)
    {
        stage = Stages.FINISHED;    // time is over for users to join

        // TODO: add a require here so that only the oracle contract can
        // call the fulfill alarm method
        RandomnessInterface(governance.randomness()).requestRandomNumber(id, 0x5eed);

        id = id + 1;
    }


    /**
     * @dev callback fulfillRandomness
     * @dev store and later process random number
     */
    function close(uint256 randomNumberVRF) external atStage(Stages.FINISHED) {
        require(randomNumberVRF > 0, "random number not yet ready");

        lastRandom = randomNumberVRF;
        alarmReceivedTime = block.timestamp;

        uint256 index = lastRandom % players.length;

        stage = Stages.RANDOM_PROCESSED;

        // transfer contract balance to winner
        uint256 amount = address(this).balance;
        players[index].transfer(amount);
        emit Winner(id, lastRandom, index, players[index], amount);
        stage = Stages.WINNER_PAID;
    }


    function resetLottery() external onlyOwner {
        // reset players
        // TODO: reset lobbies/groups rather than players
        lastRandom = 0;
        players = new address payable[](0);
        stage = Stages.CLOSED;
        emit Close(id);
    }

    /**
     * @notice Returns the address of the LINK token
     * @dev This is the public implementation for chainlinkTokenAddress, which is
     * an internal method of the ChainlinkClient contract
     */
    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }
/*
    function getPlayer(address _player) public view returns (address payable) {
        uint256 _playerId = playerIdsByAddress[_player];
        return players[_playerId];
    }
*/
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

    // emergency function if process got stuck
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
