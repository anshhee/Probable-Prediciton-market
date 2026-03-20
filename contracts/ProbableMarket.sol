// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProbableMarket {
    enum MarketState { Active, Resolved, Canceled }

    struct Market {
        uint64 endTime;
        MarketState state;
        address oracle;
        uint256 yesShares;
        uint256 noShares;
        bytes32 questionHash;
    }

    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        address indexed oracle,
        string question,
        uint64 endTime
    );

    function createMarket(
        string memory question,
        uint64 endTime,
        address oracle
    ) external {
        require(endTime > block.timestamp, "Invalid endTime");

        marketCount++;
        uint256 marketId = marketCount;

        markets[marketId] = Market({
            endTime: endTime,
            state: MarketState.Active,
            oracle: oracle,
            yesShares: 0,
            noShares: 0,
            questionHash: keccak256(bytes(question))
        });

        emit MarketCreated(
            marketId,
            msg.sender,
            oracle,
            question,
            endTime
        );
    }
}
