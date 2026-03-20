// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProbableMarket {
    enum MarketState { Active, ResolvedYes, ResolvedNo, Canceled }

    error InvalidEndTime();
    error InvalidValue();
    error InvalidMarket();
    error MarketNotActive();
    error MarketExpired();
    error MarketNotExpired();
    error NotOracle();
    error MarketNotResolved();
    error NoWinningShares();
    error TransferFailed();

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
    
    // marketId => user => isYes => amount
    mapping(uint256 => mapping(address => mapping(bool => uint256))) public userShares;

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        address indexed oracle,
        string question,
        uint64 endTime
    );

    event SharesTraded(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        bool isBuy
    );

    event MarketResolved(
        uint256 indexed marketId,
        address indexed oracle,
        bool outcome
    );

    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    function createMarket(
        string memory question,
        uint64 endTime,
        address oracle
    ) external {
        if (endTime <= block.timestamp) revert InvalidEndTime();

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

    function buyShares(uint256 marketId, bool isYes) external payable {
        if (msg.value == 0) revert InvalidValue();
        if (marketId == 0 || marketId > marketCount) revert InvalidMarket();
        
        Market storage market = markets[marketId];
        if (market.state != MarketState.Active) revert MarketNotActive();
        if (block.timestamp >= market.endTime) revert MarketExpired();

        if (isYes) {
            market.yesShares += msg.value;
        } else {
            market.noShares += msg.value;
        }

        userShares[marketId][msg.sender][isYes] += msg.value;

        emit SharesTraded(marketId, msg.sender, isYes, msg.value, true);
    }

    function resolveMarket(uint256 marketId, bool outcome) external {
        if (marketId == 0 || marketId > marketCount) revert InvalidMarket();
        
        Market storage market = markets[marketId];
        if (msg.sender != market.oracle) revert NotOracle();
        if (market.state != MarketState.Active) revert MarketNotActive();
        if (block.timestamp < market.endTime) revert MarketNotExpired();

        market.state = outcome ? MarketState.ResolvedYes : MarketState.ResolvedNo;

        emit MarketResolved(marketId, msg.sender, outcome);
    }

    function claimReward(uint256 marketId) external {
        if (marketId == 0 || marketId > marketCount) revert InvalidMarket();
        
        Market storage market = markets[marketId];
        if (market.state == MarketState.Active) revert MarketNotResolved();

        uint256 yesSharesOwned = userShares[marketId][msg.sender][true];
        uint256 noSharesOwned = userShares[marketId][msg.sender][false];
        
        uint256 payout = 0;

        if (market.state == MarketState.Canceled) {
            payout = yesSharesOwned + noSharesOwned;
            if (payout == 0) revert NoWinningShares();
            
            userShares[marketId][msg.sender][true] = 0;
            userShares[marketId][msg.sender][false] = 0;
        } else {
            bool isYes = market.state == MarketState.ResolvedYes;
            uint256 shares = isYes ? yesSharesOwned : noSharesOwned;
            
            if (shares == 0) revert NoWinningShares();

            uint256 totalPool = market.yesShares + market.noShares;
            uint256 winningShares = isYes ? market.yesShares : market.noShares;

            // Reset shares before transfer to prevent re-entrancy
            userShares[marketId][msg.sender][isYes] = 0;

            payout = (shares * totalPool) / winningShares;
        }

        emit WinningsClaimed(marketId, msg.sender, payout);

        (bool success, ) = msg.sender.call{value: payout}("");
        if (!success) revert TransferFailed();
    }

    function cancelMarket(uint256 marketId) external {
        if (marketId == 0 || marketId > marketCount) revert InvalidMarket();
        
        Market storage market = markets[marketId];
        if (msg.sender != market.oracle) revert NotOracle();
        if (market.state != MarketState.Active) revert MarketNotActive();

        market.state = MarketState.Canceled;

        emit MarketResolved(marketId, msg.sender, false);
    }
}
