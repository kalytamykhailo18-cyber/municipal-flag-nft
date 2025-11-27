const hre = require("hardhat");
require("dotenv").config({ path: "../.env" });

async function main() {
  console.log("🚀 Deploying MunicipalFlagNFT contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Get base URI from environment or use default
  const baseURI = process.env.NFT_BASE_URI || "https://gateway.pinata.cloud/ipfs/";
  console.log("🔗 Base URI:", baseURI);

  // Deploy contract
  const MunicipalFlagNFT = await hre.ethers.getContractFactory("MunicipalFlagNFT");
  const contract = await MunicipalFlagNFT.deploy(baseURI);

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("\n✅ MunicipalFlagNFT deployed to:", contractAddress);

  // Verify contract info
  console.log("\n📋 Contract Information:");
  console.log("   Name:", await contract.name());
  console.log("   Symbol:", await contract.symbol());
  console.log("   Owner:", await contract.owner());

  // Network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("\n🌐 Network:", network.name);
  console.log("   Chain ID:", network.chainId.toString());

  // Save deployment info
  console.log("\n📁 Deployment Summary:");
  console.log("   ----------------------------------------");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("   ----------------------------------------");
  console.log("\n⚠️  Please update your .env file with the CONTRACT_ADDRESS above!");

  // If on testnet, provide verification command
  if (network.chainId === 80002n) {
    console.log("\n📝 To verify on PolygonScan, run:");
    console.log(`   npx hardhat verify --network amoy ${contractAddress} "${baseURI}"`);
  }

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
