// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MunicipalFlagNFT
 * @dev ERC721 contract for Municipal Flag NFT Game
 *
 * Each flag has a pair of NFTs:
 * - First NFT: Free to claim (shows interest)
 * - Second NFT: Purchased to complete the pair
 *
 * Flag Categories:
 * - Standard (0): No discounts
 * - Plus (1): 50% discount on future Standard purchases
 * - Premium (2): 75% permanent discount on Standard purchases
 */
contract MunicipalFlagNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    uint256 private _tokenIdCounter;
    string private _baseTokenURI;

    // Flag categories
    uint8 public constant CATEGORY_STANDARD = 0;
    uint8 public constant CATEGORY_PLUS = 1;
    uint8 public constant CATEGORY_PREMIUM = 2;

    // Discount percentages (in basis points, 10000 = 100%)
    uint256 public constant PLUS_DISCOUNT = 5000;     // 50%
    uint256 public constant PREMIUM_DISCOUNT = 7500;  // 75%

    // Flag pair structure
    struct FlagPair {
        uint256 flagId;
        uint256 firstTokenId;
        uint256 secondTokenId;
        bool firstMinted;
        bool secondMinted;
        bool pairComplete;
        uint8 category;
        uint256 price;
    }

    // Mappings
    mapping(uint256 => FlagPair) public flagPairs;
    mapping(uint256 => uint256) public tokenToFlag;
    mapping(address => bool) public hasPlus;
    mapping(address => bool) public hasPremium;

    // Track registered flags
    uint256[] private _registeredFlagIds;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event FlagRegistered(
        uint256 indexed flagId,
        uint8 category,
        uint256 price
    );

    event FirstNFTClaimed(
        uint256 indexed flagId,
        uint256 indexed tokenId,
        address indexed claimer
    );

    event SecondNFTPurchased(
        uint256 indexed flagId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 pricePaid
    );

    event PairCompleted(uint256 indexed flagId);

    event BaseURIUpdated(string newBaseURI);

    event Withdrawal(address indexed to, uint256 amount);

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor(
        string memory baseURI
    ) ERC721("Municipal Flag NFT", "MFLAG") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Register a new flag for the game
     * @param flagId Unique identifier for the flag
     * @param category Flag category (0=Standard, 1=Plus, 2=Premium)
     * @param price Price in wei for the second NFT
     */
    function registerFlag(
        uint256 flagId,
        uint8 category,
        uint256 price
    ) external onlyOwner {
        require(flagPairs[flagId].flagId == 0, "Flag already registered");
        require(category <= CATEGORY_PREMIUM, "Invalid category");
        require(price > 0, "Price must be greater than 0");

        flagPairs[flagId] = FlagPair({
            flagId: flagId,
            firstTokenId: 0,
            secondTokenId: 0,
            firstMinted: false,
            secondMinted: false,
            pairComplete: false,
            category: category,
            price: price
        });

        _registeredFlagIds.push(flagId);

        emit FlagRegistered(flagId, category, price);
    }

    /**
     * @dev Batch register multiple flags
     * @param flagIds Array of flag IDs
     * @param categories Array of categories
     * @param prices Array of prices
     */
    function batchRegisterFlags(
        uint256[] calldata flagIds,
        uint8[] calldata categories,
        uint256[] calldata prices
    ) external onlyOwner {
        require(
            flagIds.length == categories.length &&
            flagIds.length == prices.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < flagIds.length; i++) {
            require(flagPairs[flagIds[i]].flagId == 0, "Flag already registered");
            require(categories[i] <= CATEGORY_PREMIUM, "Invalid category");
            require(prices[i] > 0, "Price must be greater than 0");

            flagPairs[flagIds[i]] = FlagPair({
                flagId: flagIds[i],
                firstTokenId: 0,
                secondTokenId: 0,
                firstMinted: false,
                secondMinted: false,
                pairComplete: false,
                category: categories[i],
                price: prices[i]
            });

            _registeredFlagIds.push(flagIds[i]);

            emit FlagRegistered(flagIds[i], categories[i], prices[i]);
        }
    }

    /**
     * @dev Update the base URI for token metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(owner(), balance);
    }

    // =============================================================================
    // PUBLIC FUNCTIONS
    // =============================================================================

    /**
     * @dev Claim the first NFT of a flag pair (free)
     * @param flagId The flag ID to claim
     */
    function claimFirstNFT(uint256 flagId) external {
        FlagPair storage pair = flagPairs[flagId];

        require(pair.flagId != 0, "Flag not registered");
        require(!pair.firstMinted, "First NFT already claimed");

        // Mint the first NFT
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);

        // Update flag pair
        pair.firstTokenId = newTokenId;
        pair.firstMinted = true;
        tokenToFlag[newTokenId] = flagId;

        emit FirstNFTClaimed(flagId, newTokenId, msg.sender);
    }

    /**
     * @dev Purchase the second NFT of a flag pair
     * @param flagId The flag ID to purchase
     */
    function purchaseSecondNFT(uint256 flagId) external payable {
        FlagPair storage pair = flagPairs[flagId];

        require(pair.flagId != 0, "Flag not registered");
        require(pair.firstMinted, "First NFT must be claimed first");
        require(!pair.secondMinted, "Second NFT already purchased");

        // Calculate price with potential discount
        uint256 finalPrice = getPriceWithDiscount(flagId, msg.sender);
        require(msg.value >= finalPrice, "Insufficient payment");

        // Mint the second NFT
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);

        // Update flag pair
        pair.secondTokenId = newTokenId;
        pair.secondMinted = true;
        pair.pairComplete = true;
        tokenToFlag[newTokenId] = flagId;

        // Update discount eligibility based on category
        if (pair.category == CATEGORY_PLUS && !hasPlus[msg.sender]) {
            hasPlus[msg.sender] = true;
        } else if (pair.category == CATEGORY_PREMIUM && !hasPremium[msg.sender]) {
            hasPremium[msg.sender] = true;
        }

        // Refund excess payment
        if (msg.value > finalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - finalPrice}("");
            require(refundSuccess, "Refund failed");
        }

        emit SecondNFTPurchased(flagId, newTokenId, msg.sender, finalPrice);
        emit PairCompleted(flagId);
    }

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    /**
     * @dev Get flag pair information
     * @param flagId The flag ID
     * @return FlagPair struct
     */
    function getFlagPair(uint256 flagId) external view returns (FlagPair memory) {
        return flagPairs[flagId];
    }

    /**
     * @dev Calculate price with discount for a buyer
     * @param flagId The flag ID
     * @param buyer The buyer address
     * @return Final price after discount
     */
    function getPriceWithDiscount(
        uint256 flagId,
        address buyer
    ) public view returns (uint256) {
        FlagPair memory pair = flagPairs[flagId];
        require(pair.flagId != 0, "Flag not registered");

        uint256 basePrice = pair.price;

        // Only apply discounts to Standard category flags
        if (pair.category == CATEGORY_STANDARD) {
            if (hasPremium[buyer]) {
                // 75% discount
                return basePrice - (basePrice * PREMIUM_DISCOUNT / 10000);
            } else if (hasPlus[buyer]) {
                // 50% discount
                return basePrice - (basePrice * PLUS_DISCOUNT / 10000);
            }
        }

        return basePrice;
    }

    /**
     * @dev Get total number of registered flags
     * @return Total count
     */
    function getTotalRegisteredFlags() external view returns (uint256) {
        return _registeredFlagIds.length;
    }

    /**
     * @dev Get all registered flag IDs
     * @return Array of flag IDs
     */
    function getRegisteredFlagIds() external view returns (uint256[] memory) {
        return _registeredFlagIds;
    }

    /**
     * @dev Check if user has Plus discount
     * @param user Address to check
     * @return bool
     */
    function userHasPlus(address user) external view returns (bool) {
        return hasPlus[user];
    }

    /**
     * @dev Check if user has Premium discount
     * @param user Address to check
     * @return bool
     */
    function userHasPremium(address user) external view returns (bool) {
        return hasPremium[user];
    }

    /**
     * @dev Get the flag ID for a token
     * @param tokenId The token ID
     * @return Flag ID
     */
    function getFlagIdForToken(uint256 tokenId) external view returns (uint256) {
        return tokenToFlag[tokenId];
    }

    // =============================================================================
    // OVERRIDES
    // =============================================================================

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
