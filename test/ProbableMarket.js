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
      const endTime = (await time.latest()) + ONE_DAY_IN_SECS;

      await expect(probableMarket.createMarket(question, endTime, oracle.address))
        .to.emit(probableMarket, "MarketCreated");

      expect(await probableMarket.marketCount()).to.equal(1);
      const market = await probableMarket.markets(1);
      expect(market.endTime).to.equal(endTime);
      expect(market.state).to.equal(0);
      expect(market.oracle).to.equal(oracle.address);
      expect(market.yesShares).to.equal(0);
      expect(market.noShares).to.equal(0);
    });

    it("Should revert if endTime is in the past", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);
      const question = "Will ETH reach $5000 by 2026?";
      const pastTime = (await time.latest()) - 60;
      await expect(
        probableMarket.createMarket(question, pastTime, oracle.address)
      ).to.be.revertedWithCustomError(probableMarket, "InvalidEndTime");
    });
  });

  describe("buyShares", function () {
    it("Should buy YES shares successfully and emit event", async function () {
      const { probableMarket, otherAccount, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Will ETH reach $5000 by 2026?", endTime, oracle.address);
      const amountToBuy = ethers.parseEther("1");

      await expect(probableMarket.connect(otherAccount).buyShares(1, true, { value: amountToBuy }))
        .to.emit(probableMarket, "SharesTraded")
        .withArgs(1, otherAccount.address, true, amountToBuy, true);

      const market = await probableMarket.markets(1);
      expect(market.yesShares).to.equal(amountToBuy);
      expect(market.noShares).to.equal(0);
      const userShares = await probableMarket.userShares(1, otherAccount.address, true);
      expect(userShares).to.equal(amountToBuy);
    });

    it("Should buy NO shares successfully", async function () {
      const { probableMarket, otherAccount, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);
      const amountToBuy = ethers.parseEther("0.5");

      await probableMarket.connect(otherAccount).buyShares(1, false, { value: amountToBuy });
      const market = await probableMarket.markets(1);
      expect(market.noShares).to.equal(amountToBuy);
    });

    it("Should revert if msg.value is 0", async function () {
      const { probableMarket, otherAccount, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);
      await expect(
        probableMarket.connect(otherAccount).buyShares(1, true, { value: 0 })
      ).to.be.revertedWithCustomError(probableMarket, "InvalidValue");
    });

    it("Should revert if market does not exist", async function () {
      const { probableMarket, otherAccount } = await loadFixture(deployProbableMarketFixture);
      await expect(
        probableMarket.connect(otherAccount).buyShares(99, true, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(probableMarket, "InvalidMarket");
    });

    it("Should revert if market is expired", async function () {
      const { probableMarket, otherAccount, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);
      await time.increaseTo(endTime + 10);

      await expect(
        probableMarket.connect(otherAccount).buyShares(1, true, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(probableMarket, "MarketExpired");
    });
  });

  describe("resolveMarket", function () {
    it("Should resolve market YES successfully", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await time.increaseTo(endTime + 10);

      await expect(probableMarket.connect(oracle).resolveMarket(1, true))
        .to.emit(probableMarket, "MarketResolved")
        .withArgs(1, oracle.address, true);

      const market = await probableMarket.markets(1);
      expect(market.state).to.equal(1); // 1 == MarketState.ResolvedYes
    });

    it("Should resolve market NO successfully", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await time.increaseTo(endTime + 10);

      await expect(probableMarket.connect(oracle).resolveMarket(1, false))
        .to.emit(probableMarket, "MarketResolved")
        .withArgs(1, oracle.address, false);

      const market = await probableMarket.markets(1);
      expect(market.state).to.equal(2); // 2 == MarketState.ResolvedNo
    });

    it("Should revert if not oracle", async function () {
      const { probableMarket, oracle, otherAccount } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await time.increaseTo(endTime + 10);

      await expect(
        probableMarket.connect(otherAccount).resolveMarket(1, true)
      ).to.be.revertedWithCustomError(probableMarket, "NotOracle");
    });

    it("Should revert if time is < endTime", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      // time is not increased
      await expect(
        probableMarket.connect(oracle).resolveMarket(1, true)
      ).to.be.revertedWithCustomError(probableMarket, "MarketNotExpired");
    });

    it("Should revert if market already resolved (not active)", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await time.increaseTo(endTime + 10);
      await probableMarket.connect(oracle).resolveMarket(1, true);

      await expect(
        probableMarket.connect(oracle).resolveMarket(1, false)
      ).to.be.revertedWithCustomError(probableMarket, "MarketNotActive");
    });
  });

  describe("claimReward", function () {
    it("Should calculate and transfer reward correctly for YES outcome", async function () {
      const { probableMarket, owner, otherAccount, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      // owner buys 1 ETH YES
      await probableMarket.buyShares(1, true, { value: ethers.parseEther("1") });
      // otherAccount buys 3 ETH NO
      await probableMarket.connect(otherAccount).buyShares(1, false, { value: ethers.parseEther("3") });

      // Fast forward and resolve YES
      await time.increaseTo(endTime + 10);
      await probableMarket.connect(oracle).resolveMarket(1, true);

      // Owner should receive total pool (4 ETH)
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await probableMarket.claimReward(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance + gasUsed - initialBalance).to.equal(ethers.parseEther("4"));

      // Verify event
      await expect(tx)
        .to.emit(probableMarket, "WinningsClaimed")
        .withArgs(1, owner.address, ethers.parseEther("4"));

      // Verify shares reset
      const shares = await probableMarket.userShares(1, owner.address, true);
      expect(shares).to.equal(0);
    });

    it("Should revert if market is not resolved", async function () {
      const { probableMarket, owner, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);
      
      await probableMarket.buyShares(1, true, { value: ethers.parseEther("1") });

      await expect(probableMarket.claimReward(1))
        .to.be.revertedWithCustomError(probableMarket, "MarketNotResolved");
    });

    it("Should revert if user has no winning shares", async function () {
      const { probableMarket, owner, otherAccount, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      // owner buys YES, market resolves NO
      await probableMarket.buyShares(1, true, { value: ethers.parseEther("1") });
      
      await time.increaseTo(endTime + 10);
      await probableMarket.connect(oracle).resolveMarket(1, false);

      await expect(probableMarket.claimReward(1))
        .to.be.revertedWithCustomError(probableMarket, "NoWinningShares");
    });

    it("Should revert on double claim", async function () {
      const { probableMarket, owner, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await probableMarket.buyShares(1, true, { value: ethers.parseEther("1") });
      
      await time.increaseTo(endTime + 10);
      await probableMarket.connect(oracle).resolveMarket(1, true);

      // First claim succeeds
      await probableMarket.claimReward(1);
      // Second claim fails
      await expect(probableMarket.claimReward(1))
        .to.be.revertedWithCustomError(probableMarket, "NoWinningShares");
    });

    it("Should refund YES + NO shares if market is canceled", async function () {
      const { probableMarket, owner, otherAccount, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      // owner buys 1 ETH YES and 0.5 ETH NO
      await probableMarket.buyShares(1, true, { value: ethers.parseEther("1") });
      await probableMarket.buyShares(1, false, { value: ethers.parseEther("0.5") });

      // Market is canceled
      await probableMarket.connect(oracle).cancelMarket(1);

      // Owner should receive full 1.5 ETH refund
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await probableMarket.claimReward(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance + gasUsed - initialBalance).to.equal(ethers.parseEther("1.5"));

      // Verify event
      await expect(tx)
        .to.emit(probableMarket, "WinningsClaimed")
        .withArgs(1, owner.address, ethers.parseEther("1.5"));

      // Verify shares reset
      const yesShares = await probableMarket.userShares(1, owner.address, true);
      const noShares = await probableMarket.userShares(1, owner.address, false);
      expect(yesShares).to.equal(0);
      expect(noShares).to.equal(0);
    });

    it("Should revert on double refund claim for canceled market", async function () {
      const { probableMarket, owner, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await probableMarket.buyShares(1, true, { value: ethers.parseEther("1") });
      await probableMarket.connect(oracle).cancelMarket(1);

      await probableMarket.claimReward(1);
      
      await expect(probableMarket.claimReward(1))
        .to.be.revertedWithCustomError(probableMarket, "NoWinningShares");
    });
  });

  describe("cancelMarket", function () {
    it("Should cancel market successfully", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await expect(probableMarket.connect(oracle).cancelMarket(1))
        .to.emit(probableMarket, "MarketResolved")
        .withArgs(1, oracle.address, false);

      const market = await probableMarket.markets(1);
      expect(market.state).to.equal(3); // 3 == MarketState.Canceled
    });

    it("Should revert if not oracle", async function () {
      const { probableMarket, oracle, otherAccount } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await expect(probableMarket.connect(otherAccount).cancelMarket(1))
        .to.be.revertedWithCustomError(probableMarket, "NotOracle");
    });

    it("Should revert if market is not active", async function () {
      const { probableMarket, oracle } = await loadFixture(deployProbableMarketFixture);
      const endTime = (await time.latest()) + 24 * 60 * 60;
      await probableMarket.createMarket("Test", endTime, oracle.address);

      await probableMarket.connect(oracle).cancelMarket(1);

      await expect(probableMarket.connect(oracle).cancelMarket(1))
        .to.be.revertedWithCustomError(probableMarket, "MarketNotActive");
    });
  });
});
