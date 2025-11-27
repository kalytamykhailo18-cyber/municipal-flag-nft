const hre = require("hardhat");
require("dotenv").config({ path: "../.env" });

/**
 * Script to register demo flags on the deployed contract.
 * Run this after deployment to populate the contract with flag data.
 */
async function main() {
  console.log("🚩 Registering flags on MunicipalFlagNFT contract...\n");

  // Get contract address from environment
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not set in .env file");
  }

  console.log("📝 Contract address:", contractAddress);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // Connect to deployed contract
  const MunicipalFlagNFT = await hre.ethers.getContractFactory("MunicipalFlagNFT");
  const contract = MunicipalFlagNFT.attach(contractAddress);

  // Define flag data
  // Total: 64 flags (4 countries × 1 region × 2 municipalities × 8 flags)
  const CATEGORY_STANDARD = 0;
  const CATEGORY_PLUS = 1;
  const CATEGORY_PREMIUM = 2;

  const PRICE_STANDARD = hre.ethers.parseEther(process.env.DEFAULT_STANDARD_PRICE || "0.01");
  const PRICE_PLUS = hre.ethers.parseEther(process.env.DEFAULT_PLUS_PRICE || "0.02");
  const PRICE_PREMIUM = hre.ethers.parseEther(process.env.DEFAULT_PREMIUM_PRICE || "0.05");

  // Generate flag data for 64 flags
  // Distribution: ~60% Standard, ~30% Plus, ~10% Premium
  const flagData = [];

  for (let i = 1; i <= 64; i++) {
    let category, price;

    // Town Hall flags (every 8th starting from 1) are Premium
    if (i % 8 === 1) {
      category = CATEGORY_PREMIUM;
      price = PRICE_PREMIUM;
    }
    // Fire Station and Bridge flags are Plus
    else if (i % 8 === 2 || i % 8 === 7) {
      category = CATEGORY_PLUS;
      price = PRICE_PLUS;
    }
    // Rest are Standard
    else {
      category = CATEGORY_STANDARD;
      price = PRICE_STANDARD;
    }

    flagData.push({
      flagId: i,
      category: category,
      price: price,
    });
  }

  // Check current registration status
  const currentCount = await contract.getTotalRegisteredFlags();
  console.log(`\n📊 Currently registered flags: ${currentCount}`);

  if (currentCount >= 64n) {
    console.log("✅ All flags already registered!");
    return;
  }

  // Batch register flags (in groups of 20 to avoid gas limits)
  const batchSize = 20;
  const totalFlags = flagData.length;

  for (let i = 0; i < totalFlags; i += batchSize) {
    const batch = flagData.slice(i, Math.min(i + batchSize, totalFlags));

    const flagIds = batch.map((f) => f.flagId);
    const categories = batch.map((f) => f.category);
    const prices = batch.map((f) => f.price);

    console.log(`\n📦 Registering batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalFlags / batchSize)}`);
    console.log(`   Flag IDs: ${flagIds[0]} - ${flagIds[flagIds.length - 1]}`);

    try {
      const tx = await contract.batchRegisterFlags(flagIds, categories, prices);
      console.log(`   Transaction: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Batch registered successfully!`);
    } catch (error) {
      if (error.message.includes("Flag already registered")) {
        console.log(`   ⚠️ Some flags in this batch already registered, skipping...`);
      } else {
        throw error;
      }
    }
  }

  // Verify final count
  const finalCount = await contract.getTotalRegisteredFlags();
  console.log(`\n🎉 Registration complete!`);
  console.log(`   Total registered flags: ${finalCount}`);

  // Show summary
  console.log("\n📋 Summary:");
  console.log("   Premium flags (Town Hall): 8");
  console.log("   Plus flags (Fire Station, Bridge): 16");
  console.log("   Standard flags (Other): 40");
  console.log("   Total: 64");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Registration failed:", error);
    process.exit(1);
  });
