const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("ProbableMarket", function () {
  async function deployProbableMarketFixture() {
    const [owner, oracle, otherAccount] = await ethers.getSigners();

    const ProbableMarket = await ethers.getContractFactory("ProbableMarket");
    const probableMarket = await ProbableMarket.deploy();

    return { probableMarket, owner, oracle, otherAccount };
  }

  describe("createMarket", function () {
    it("Should create a market successfully", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);

      const question = "Will ETH reach $5000 by 2026?";
      const ONE_DAY_IN_SECS = 24 * 60 * 60;
      const endTime = (await time.latest()) + ONE_DAY_IN_SECS; // Future timestamp

      // Create market
      await expect(probableMarket.createMarket(question, endTime, oracle.address))
        .to.emit(probableMarket, "MarketCreated");

      // Verify marketCount increased
      expect(await probableMarket.marketCount()).to.equal(1);

      // Verify stored market details
      const market = await probableMarket.markets(1);
      
      expect(market.endTime).to.equal(endTime);
      expect(market.state).to.equal(0); // 0 == MarketState.Active
      expect(market.oracle).to.equal(oracle.address);
      expect(market.yesShares).to.equal(0);
      expect(market.noShares).to.equal(0);
    });

    it("Should revert if endTime is in the past", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);

      const question = "Will ETH reach $5000 by 2026?";
      const ONE_MINUTE_IN_SECS = 60;
      const pastTime = (await time.latest()) - ONE_MINUTE_IN_SECS;

      await expect(
        probableMarket.createMarket(question, pastTime, oracle.address)
      ).to.be.revertedWith("Invalid endTime");
    });
  });
});
