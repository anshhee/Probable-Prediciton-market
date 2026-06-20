const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("🚀 Deploying ProbableMarket to", hre.network.name, "...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("📫 Deployer address:", deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH\n");

    if (balance === 0n) {
        throw new Error(
            "Deployer account has no ETH. Fund your Sepolia wallet first."
        );
    }

    // Deploy contract
    const ProbableMarket = await ethers.getContractFactory("ProbableMarket");
    const probableMarket = await ProbableMarket.deploy();

    await probableMarket.waitForDeployment();

    const deployedAddress = await probableMarket.getAddress();

    console.log("✅ ProbableMarket deployed!");
    console.log("📄 Contract address:", deployedAddress);
    console.log(
        "🔍 View on Etherscan: https://sepolia.etherscan.io/address/" +
        deployedAddress
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
