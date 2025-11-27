# Smart Contract Test Documentation

## Overview

This document describes the Hardhat tests for the `MunicipalFlagNFT` smart contract. All tests validate the core functionality of the NFT game including deployment, flag registration, NFT claiming/purchasing, discount system, and withdrawals.

## Prerequisites

- Node.js v18+
- npm or yarn
- Hardhat environment configured

## Running Tests

```bash
cd contracts
npm install
npx hardhat test
```

For verbose output:
```bash
npx hardhat test --verbose
```

For gas reporting:
```bash
REPORT_GAS=true npx hardhat test
```

## Test Categories

### 1. Deployment Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Should deploy successfully | Contract deploys without errors | Contract address is valid |
| Should set correct name/symbol | Verify ERC721 metadata | Name: "Municipal Flag NFT", Symbol: "MFLAG" |
| Should set correct owner | Deployer is owner | Owner matches deployer address |
| Should have zero flags initially | No flags registered at deploy | getTotalRegisteredFlags() returns 0 |

### 2. Flag Registration Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Owner can register Standard flag | Admin registers flag with category 0 | FlagRegistered event emitted |
| Owner can register Plus flag | Admin registers flag with category 1 | Flag saved with Plus category |
| Owner can register Premium flag | Admin registers flag with category 2 | Flag saved with Premium category |
| Non-owner cannot register | User tries to register | Reverts with OwnableUnauthorizedAccount |
| Cannot register twice | Same flagId registered twice | Reverts with "Flag already registered" |
| Invalid category rejected | Category > 2 used | Reverts with "Invalid category" |
| Zero price rejected | Price = 0 | Reverts with "Price must be greater than 0" |
| Batch registration works | Multiple flags at once | All flags registered, events emitted |

### 3. First NFT Claim Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| User can claim for free | claimFirstNFT called | NFT minted, FirstNFTClaimed event |
| Cannot claim twice | Second claim attempted | Reverts with "First NFT already claimed" |
| Cannot claim unregistered | Invalid flagId used | Reverts with "Flag not registered" |
| Token maps to flag | getFlagIdForToken called | Returns correct flagId |

### 4. Second NFT Purchase Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| User can purchase | purchaseSecondNFT with value | NFT minted, PairCompleted event |
| Cannot purchase before claim | First NFT not claimed | Reverts with "First NFT must be claimed first" |
| Cannot purchase twice | Second already purchased | Reverts with "Second NFT already purchased" |
| Insufficient payment rejected | Value < price | Reverts with "Insufficient payment" |
| Excess payment refunded | Value > price | Excess returned to buyer |

### 5. Discount System Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Plus grants 50% discount | Plus owner buys Standard | Price is 50% of base |
| Premium grants 75% discount | Premium owner buys Standard | Price is 25% of base |
| Premium takes precedence | Has both Plus and Premium | 75% discount applied |
| No discount on Plus/Premium | Discount on non-Standard | Full price charged |
| No discount without ownership | New user | Full price returned |

### 6. Withdrawal Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Owner can withdraw | withdraw() called | Balance transferred to owner |
| Non-owner cannot withdraw | User calls withdraw | Reverts with OwnableUnauthorizedAccount |
| Empty balance rejected | No funds in contract | Reverts with "No balance to withdraw" |

### 7. Base URI Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Token URI formatted correctly | tokenURI(1) called | Returns baseURI + "1.json" |
| Owner can update URI | setBaseURI called | BaseURIUpdated event, URI changes |
| Non-owner cannot update | User calls setBaseURI | Reverts with OwnableUnauthorizedAccount |

### 8. ERC721 Enumerable Tests

| Test | Description | Expected Result |
|------|-------------|-----------------|
| totalSupply increases | Multiple mints | Supply equals minted count |
| tokenOfOwnerByIndex works | Query owner's tokens | Returns correct token IDs |

## Sample Test Output

```
  MunicipalFlagNFT
    Deployment
      ✓ Should deploy successfully
      ✓ Should set the correct name and symbol
      ✓ Should set the correct owner
      ✓ Should have zero registered flags initially
    Flag Registration
      ✓ Owner can register a Standard flag
      ✓ Owner can register a Plus flag
      ✓ Owner can register a Premium flag
      ✓ Non-owner cannot register a flag
      ✓ Cannot register same flag ID twice
      ✓ Cannot register with invalid category
      ✓ Cannot register with zero price
      ✓ Can batch register multiple flags
    First NFT Claim
      ✓ User can claim first NFT for free
      ✓ Cannot claim first NFT twice
      ✓ Cannot claim unregistered flag
      ✓ Token is mapped to correct flag
    Second NFT Purchase
      ✓ User can purchase second NFT
      ✓ Cannot purchase before first is claimed
      ✓ Cannot purchase second NFT twice
      ✓ Cannot purchase with insufficient payment
      ✓ Excess payment is refunded
    Discount System
      ✓ Plus purchase grants 50% discount on Standard
      ✓ Premium purchase grants 75% discount on Standard
      ✓ Premium discount takes precedence over Plus
      ✓ No discount on Plus/Premium category flags
      ✓ User without discounts pays full price
    Withdrawal
      ✓ Owner can withdraw funds
      ✓ Non-owner cannot withdraw
      ✓ Cannot withdraw when balance is zero
    Base URI
      ✓ Token URI is correctly formatted
      ✓ Owner can update base URI
      ✓ Non-owner cannot update base URI
    ERC721 Enumerable
      ✓ totalSupply increases with mints
      ✓ tokenOfOwnerByIndex works correctly

  33 passing (2s)
```

## Test Coverage

To generate coverage report:

```bash
npx hardhat coverage
```

Target coverage: >90% for all categories.

## Gas Usage

Typical gas costs (on local network):

| Function | Gas |
|----------|-----|
| registerFlag | ~100,000 |
| claimFirstNFT | ~150,000 |
| purchaseSecondNFT | ~170,000 |
| setBaseURI | ~35,000 |
| withdraw | ~30,000 |

## Troubleshooting

1. **Tests fail with "Cannot find module"**
   - Run `npm install` in the contracts directory

2. **Tests timeout**
   - Increase timeout in hardhat.config.js

3. **Gas estimation fails**
   - Ensure local node is running for network tests
