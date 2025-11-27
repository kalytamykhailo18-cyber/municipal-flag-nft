const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MunicipalFlagNFT", function () {
  let contract;
  let owner;
  let user1;
  let user2;
  let user3;

  const BASE_URI = "https://gateway.pinata.cloud/ipfs/test/";
  const FLAG_ID_1 = 1;
  const FLAG_ID_2 = 2;
  const FLAG_ID_3 = 3;

  const CATEGORY_STANDARD = 0;
  const CATEGORY_PLUS = 1;
  const CATEGORY_PREMIUM = 2;

  const PRICE_STANDARD = ethers.parseEther("0.01");
  const PRICE_PLUS = ethers.parseEther("0.02");
  const PRICE_PREMIUM = ethers.parseEther("0.05");

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const MunicipalFlagNFT = await ethers.getContractFactory("MunicipalFlagNFT");
    contract = await MunicipalFlagNFT.deploy(BASE_URI);
    await contract.waitForDeployment();
  });

  // ===========================================================================
  // DEPLOYMENT TESTS
  // ===========================================================================

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("Should set the correct name and symbol", async function () {
      expect(await contract.name()).to.equal("Municipal Flag NFT");
      expect(await contract.symbol()).to.equal("MFLAG");
    });

    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should have zero registered flags initially", async function () {
      expect(await contract.getTotalRegisteredFlags()).to.equal(0);
    });
  });

  // ===========================================================================
  // FLAG REGISTRATION TESTS
  // ===========================================================================

  describe("Flag Registration", function () {
    it("Owner can register a Standard flag", async function () {
      await expect(contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD))
        .to.emit(contract, "FlagRegistered")
        .withArgs(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);

      const pair = await contract.getFlagPair(FLAG_ID_1);
      expect(pair.flagId).to.equal(FLAG_ID_1);
      expect(pair.category).to.equal(CATEGORY_STANDARD);
      expect(pair.price).to.equal(PRICE_STANDARD);
      expect(pair.firstMinted).to.be.false;
      expect(pair.secondMinted).to.be.false;
      expect(pair.pairComplete).to.be.false;
    });

    it("Owner can register a Plus flag", async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_PLUS, PRICE_PLUS);
      const pair = await contract.getFlagPair(FLAG_ID_1);
      expect(pair.category).to.equal(CATEGORY_PLUS);
    });

    it("Owner can register a Premium flag", async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_PREMIUM, PRICE_PREMIUM);
      const pair = await contract.getFlagPair(FLAG_ID_1);
      expect(pair.category).to.equal(CATEGORY_PREMIUM);
    });

    it("Non-owner cannot register a flag", async function () {
      await expect(
        contract.connect(user1).registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("Cannot register same flag ID twice", async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);
      await expect(
        contract.registerFlag(FLAG_ID_1, CATEGORY_PLUS, PRICE_PLUS)
      ).to.be.revertedWith("Flag already registered");
    });

    it("Cannot register with invalid category", async function () {
      await expect(
        contract.registerFlag(FLAG_ID_1, 3, PRICE_STANDARD)
      ).to.be.revertedWith("Invalid category");
    });

    it("Cannot register with zero price", async function () {
      await expect(
        contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Can batch register multiple flags", async function () {
      const flagIds = [1, 2, 3];
      const categories = [CATEGORY_STANDARD, CATEGORY_PLUS, CATEGORY_PREMIUM];
      const prices = [PRICE_STANDARD, PRICE_PLUS, PRICE_PREMIUM];

      await contract.batchRegisterFlags(flagIds, categories, prices);

      expect(await contract.getTotalRegisteredFlags()).to.equal(3);

      for (let i = 0; i < flagIds.length; i++) {
        const pair = await contract.getFlagPair(flagIds[i]);
        expect(pair.flagId).to.equal(flagIds[i]);
        expect(pair.category).to.equal(categories[i]);
      }
    });
  });

  // ===========================================================================
  // FIRST NFT CLAIM TESTS
  // ===========================================================================

  describe("First NFT Claim", function () {
    beforeEach(async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);
    });

    it("User can claim first NFT for free", async function () {
      await expect(contract.connect(user1).claimFirstNFT(FLAG_ID_1))
        .to.emit(contract, "FirstNFTClaimed")
        .withArgs(FLAG_ID_1, 1, user1.address);

      expect(await contract.ownerOf(1)).to.equal(user1.address);
      expect(await contract.balanceOf(user1.address)).to.equal(1);

      const pair = await contract.getFlagPair(FLAG_ID_1);
      expect(pair.firstMinted).to.be.true;
      expect(pair.firstTokenId).to.equal(1);
    });

    it("Cannot claim first NFT twice", async function () {
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
      await expect(
        contract.connect(user2).claimFirstNFT(FLAG_ID_1)
      ).to.be.revertedWith("First NFT already claimed");
    });

    it("Cannot claim unregistered flag", async function () {
      await expect(
        contract.connect(user1).claimFirstNFT(999)
      ).to.be.revertedWith("Flag not registered");
    });

    it("Token is mapped to correct flag", async function () {
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
      expect(await contract.getFlagIdForToken(1)).to.equal(FLAG_ID_1);
    });
  });

  // ===========================================================================
  // SECOND NFT PURCHASE TESTS
  // ===========================================================================

  describe("Second NFT Purchase", function () {
    beforeEach(async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
    });

    it("User can purchase second NFT", async function () {
      await expect(
        contract.connect(user2).purchaseSecondNFT(FLAG_ID_1, { value: PRICE_STANDARD })
      )
        .to.emit(contract, "SecondNFTPurchased")
        .withArgs(FLAG_ID_1, 2, user2.address, PRICE_STANDARD)
        .and.to.emit(contract, "PairCompleted")
        .withArgs(FLAG_ID_1);

      expect(await contract.ownerOf(2)).to.equal(user2.address);

      const pair = await contract.getFlagPair(FLAG_ID_1);
      expect(pair.secondMinted).to.be.true;
      expect(pair.pairComplete).to.be.true;
    });

    it("Cannot purchase before first is claimed", async function () {
      await contract.registerFlag(FLAG_ID_2, CATEGORY_STANDARD, PRICE_STANDARD);
      await expect(
        contract.connect(user1).purchaseSecondNFT(FLAG_ID_2, { value: PRICE_STANDARD })
      ).to.be.revertedWith("First NFT must be claimed first");
    });

    it("Cannot purchase second NFT twice", async function () {
      await contract.connect(user2).purchaseSecondNFT(FLAG_ID_1, { value: PRICE_STANDARD });
      await expect(
        contract.connect(user3).purchaseSecondNFT(FLAG_ID_1, { value: PRICE_STANDARD })
      ).to.be.revertedWith("Second NFT already purchased");
    });

    it("Cannot purchase with insufficient payment", async function () {
      const lowPrice = ethers.parseEther("0.001");
      await expect(
        contract.connect(user2).purchaseSecondNFT(FLAG_ID_1, { value: lowPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Excess payment is refunded", async function () {
      const excessPayment = ethers.parseEther("0.1");
      const balanceBefore = await ethers.provider.getBalance(user2.address);

      const tx = await contract.connect(user2).purchaseSecondNFT(FLAG_ID_1, { value: excessPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user2.address);
      const spent = balanceBefore - balanceAfter;

      // Should have spent approximately PRICE_STANDARD + gas, not excessPayment + gas
      expect(spent).to.be.lessThan(excessPayment);
    });
  });

  // ===========================================================================
  // DISCOUNT TESTS
  // ===========================================================================

  describe("Discount System", function () {
    beforeEach(async function () {
      // Register flags of different categories
      await contract.registerFlag(FLAG_ID_1, CATEGORY_PLUS, PRICE_PLUS);
      await contract.registerFlag(FLAG_ID_2, CATEGORY_PREMIUM, PRICE_PREMIUM);
      await contract.registerFlag(FLAG_ID_3, CATEGORY_STANDARD, PRICE_STANDARD);
    });

    it("Plus purchase grants 50% discount on Standard", async function () {
      // Claim and purchase Plus flag
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
      await contract.connect(user1).purchaseSecondNFT(FLAG_ID_1, { value: PRICE_PLUS });

      // User should now have Plus discount
      expect(await contract.userHasPlus(user1.address)).to.be.true;

      // Check discounted price for Standard flag
      const discountedPrice = await contract.getPriceWithDiscount(FLAG_ID_3, user1.address);
      expect(discountedPrice).to.equal(PRICE_STANDARD / 2n); // 50% discount
    });

    it("Premium purchase grants 75% discount on Standard", async function () {
      // Claim and purchase Premium flag
      await contract.connect(user1).claimFirstNFT(FLAG_ID_2);
      await contract.connect(user1).purchaseSecondNFT(FLAG_ID_2, { value: PRICE_PREMIUM });

      // User should now have Premium discount
      expect(await contract.userHasPremium(user1.address)).to.be.true;

      // Check discounted price for Standard flag
      const discountedPrice = await contract.getPriceWithDiscount(FLAG_ID_3, user1.address);
      expect(discountedPrice).to.equal(PRICE_STANDARD / 4n); // 75% discount (25% of original)
    });

    it("Premium discount takes precedence over Plus", async function () {
      // Get both Plus and Premium
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
      await contract.connect(user1).purchaseSecondNFT(FLAG_ID_1, { value: PRICE_PLUS });

      await contract.connect(user2).claimFirstNFT(FLAG_ID_2);
      await contract.connect(user1).purchaseSecondNFT(FLAG_ID_2, { value: PRICE_PREMIUM });

      // Should have 75% discount, not 50%
      const discountedPrice = await contract.getPriceWithDiscount(FLAG_ID_3, user1.address);
      expect(discountedPrice).to.equal(PRICE_STANDARD / 4n);
    });

    it("No discount on Plus/Premium category flags", async function () {
      // Even with Premium discount, Plus flags are full price
      await contract.connect(user1).claimFirstNFT(FLAG_ID_2);
      await contract.connect(user1).purchaseSecondNFT(FLAG_ID_2, { value: PRICE_PREMIUM });

      const plusPrice = await contract.getPriceWithDiscount(FLAG_ID_1, user1.address);
      expect(plusPrice).to.equal(PRICE_PLUS); // No discount
    });

    it("User without discounts pays full price", async function () {
      const fullPrice = await contract.getPriceWithDiscount(FLAG_ID_3, user1.address);
      expect(fullPrice).to.equal(PRICE_STANDARD);
    });
  });

  // ===========================================================================
  // WITHDRAWAL TESTS
  // ===========================================================================

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
      await contract.connect(user2).purchaseSecondNFT(FLAG_ID_1, { value: PRICE_STANDARD });
    });

    it("Owner can withdraw funds", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);

      await expect(contract.withdraw())
        .to.emit(contract, "Withdrawal")
        .withArgs(owner.address, PRICE_STANDARD);

      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Non-owner cannot withdraw", async function () {
      await expect(
        contract.connect(user1).withdraw()
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("Cannot withdraw when balance is zero", async function () {
      await contract.withdraw(); // First withdrawal
      await expect(contract.withdraw()).to.be.revertedWith("No balance to withdraw");
    });
  });

  // ===========================================================================
  // BASE URI TESTS
  // ===========================================================================

  describe("Base URI", function () {
    beforeEach(async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
    });

    it("Token URI is correctly formatted", async function () {
      const tokenURI = await contract.tokenURI(1);
      expect(tokenURI).to.equal(BASE_URI + "1.json");
    });

    it("Owner can update base URI", async function () {
      const newURI = "https://newgateway.com/ipfs/";
      await expect(contract.setBaseURI(newURI))
        .to.emit(contract, "BaseURIUpdated")
        .withArgs(newURI);

      const tokenURI = await contract.tokenURI(1);
      expect(tokenURI).to.equal(newURI + "1.json");
    });

    it("Non-owner cannot update base URI", async function () {
      await expect(
        contract.connect(user1).setBaseURI("https://hack.com/")
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  // ===========================================================================
  // VIEW FUNCTIONS TESTS
  // ===========================================================================

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);
      await contract.registerFlag(FLAG_ID_2, CATEGORY_PLUS, PRICE_PLUS);
    });

    it("getTotalRegisteredFlags returns correct count", async function () {
      expect(await contract.getTotalRegisteredFlags()).to.equal(2);
    });

    it("getRegisteredFlagIds returns all IDs", async function () {
      const ids = await contract.getRegisteredFlagIds();
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(FLAG_ID_1);
      expect(ids[1]).to.equal(FLAG_ID_2);
    });

    it("getFlagPair returns correct data", async function () {
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);

      const pair = await contract.getFlagPair(FLAG_ID_1);
      expect(pair.flagId).to.equal(FLAG_ID_1);
      expect(pair.firstMinted).to.be.true;
      expect(pair.firstTokenId).to.equal(1);
      expect(pair.secondMinted).to.be.false;
      expect(pair.pairComplete).to.be.false;
    });
  });

  // ===========================================================================
  // ERC721 ENUMERABLE TESTS
  // ===========================================================================

  describe("ERC721 Enumerable", function () {
    beforeEach(async function () {
      await contract.registerFlag(FLAG_ID_1, CATEGORY_STANDARD, PRICE_STANDARD);
      await contract.registerFlag(FLAG_ID_2, CATEGORY_STANDARD, PRICE_STANDARD);
    });

    it("totalSupply increases with mints", async function () {
      expect(await contract.totalSupply()).to.equal(0);

      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
      expect(await contract.totalSupply()).to.equal(1);

      await contract.connect(user1).purchaseSecondNFT(FLAG_ID_1, { value: PRICE_STANDARD });
      expect(await contract.totalSupply()).to.equal(2);
    });

    it("tokenOfOwnerByIndex works correctly", async function () {
      await contract.connect(user1).claimFirstNFT(FLAG_ID_1);
      await contract.connect(user1).claimFirstNFT(FLAG_ID_2);

      expect(await contract.tokenOfOwnerByIndex(user1.address, 0)).to.equal(1);
      expect(await contract.tokenOfOwnerByIndex(user1.address, 1)).to.equal(2);
    });
  });
});
