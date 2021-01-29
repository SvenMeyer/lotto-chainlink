// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/VRFRequestIDBase.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.6/interfaces/LinkTokenInterface.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import {Governance} from "./interfaces/Governance.sol";
import {Lottery}    from "./interfaces/Lottery.sol";

contract RandomNumberConsumer is VRFConsumerBase, Ownable {

    Governance public governance;

    address public chainlinkTokenAddress;

    bytes32 internal keyHash;

    /**
     * @dev Fee for requesting a random number from the VRF
     */
    uint256 internal fee;

    /**
     * @dev Mapping of lottery id => randomn result number
     */
    mapping(uint256 => uint256) public randomResults;

    /**
     * @dev Mapping of requestId to lotteryId
     */
    mapping(bytes32 => uint256) public requestIds;

    constructor(
        address _vrfCoordinator,
        address _link,
        address _governance,
        bytes32 _keyHash,
        uint256 _vrf_fee
    ) public VRFConsumerBase(_vrfCoordinator, _link) {
        chainlinkTokenAddress = _link;
        governance = Governance(_governance);
        keyHash = _keyHash;
        fee = _vrf_fee;
    }


    /**
     * @dev request a random uint256 from Chainlink VRF Coordinator
     * @dev VRF Coordinator will call function fulfillRandomness once random number is ready
     */
    function requestRandomNumber(uint256 lotteryId, uint256 userProvidedSeed) external { //returns (bytes32 requestId) {
        require(randomResults[lotteryId] == 0, "already-found-random");
        require(governance.lottery() == msg.sender,  "not-lottery-address");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK for VRF request");

        bytes32 _requestId = requestRandomness(keyHash, fee, userProvidedSeed);
        requestIds[_requestId] = lotteryId;
    }


    /**
     * @dev Callback function called by VRF Coordinator once random number is ready
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        require(msg.sender == vrfCoordinator, "Fulfilment only permitted by Coordinator");
        uint256 lotteryId = requestIds[requestId];
        randomResults[lotteryId] = randomness;
        Lottery(governance.lottery()).close(randomness);
    }


    /**
     * Withdraw LINK from this contract
     *
     * NOTE: DO NOT USE THIS IN PRODUCTION AS IT CAN BE CALLED BY ANY ADDRESS.
     * THIS IS PURELY FOR EXAMPLE PURPOSES ONLY.
     */
    function withdrawLink() external onlyOwner {
        LinkTokenInterface linkToken = LinkTokenInterface(chainlinkTokenAddress);
        require(linkToken.transfer(msg.sender, linkToken.balanceOf(address(this))), "Unable to transfer");
    }
}
