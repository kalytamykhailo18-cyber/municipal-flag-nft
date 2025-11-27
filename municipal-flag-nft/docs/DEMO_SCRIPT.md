# Demo Script - Municipal Flag NFT Game

This script provides a step-by-step walkthrough for demonstrating the application.

## Pre-Demo Checklist

- [ ] Backend running (`python main.py`)
- [ ] Frontend running (`npm start`)
- [ ] Database seeded with demo data
- [ ] Contract deployed to Polygon Amoy
- [ ] MetaMask connected with test MATIC
- [ ] Browser ready with frontend open

## Demo Flow

### 1. Introduction (Home Page)

**Navigate to**: `http://localhost:3000`

**Talking Points**:
- "This is a web game where players collect municipal flags as NFTs"
- "Each flag represents a real location in municipalities around the world"
- "Flags are AI-generated and stored on IPFS"
- Show the hero section with stats
- Explain the three categories: Standard, Plus, Premium

### 2. Geographic Navigation

**Navigate**: Home → Explore → Countries

**Talking Points**:
- "The game is organized by geographic hierarchy"
- "We have 4 countries, each with regions and municipalities"
- Click on a country (e.g., Spain)
- "Each country has regions" - click on Catalonia
- "Each region has municipalities" - show Barcelona and Girona
- Click on Barcelona to see all 8 flags

### 3. Flag Details

**Navigate**: Click on any flag card

**Talking Points**:
- "Each flag has a unique name based on its GPS coordinates"
- "The location type tells you what landmark this flag represents"
- Show the category badge (Standard/Plus/Premium)
- Show the current status (Available/Claimed/Complete)
- Explain the price displayed

### 4. Wallet Connection

**Action**: Click "Connect Wallet" in header

**Talking Points**:
- "To interact with NFTs, you need to connect your wallet"
- MetaMask popup appears - approve connection
- Show wallet address and balance in header
- "We're on Polygon Amoy testnet for this demo"

### 5. Show Interest

**Action**: On an available flag, click "Show Interest"

**Talking Points**:
- "Before claiming, users can show interest"
- "This is free and doesn't require a transaction"
- After clicking, user appears in interested list
- "This helps gauge demand for each flag"

### 6. Claim First NFT

**Action**: Click "Claim First NFT (Free)"

**Talking Points**:
- "The first NFT of each pair is free to claim"
- MetaMask transaction popup - confirm
- Wait for transaction confirmation
- "Now I own the first NFT of this flag pair"
- Show updated status: "First Claimed"
- Show ownership record below

### 7. Purchase Second NFT

**Navigate**: Find a flag with "First Claimed" status

**Talking Points**:
- "To complete the pair, someone purchases the second NFT"
- "Once complete, the pair is removed from active play"
- Show price (with discount if applicable)
- Click "Purchase Second NFT"
- Confirm MetaMask transaction
- "Pair complete! This flag is now fully collected"

### 8. Discount System

**Talking Points** (can show in flag details):
- "Collecting Plus flags gives 50% discount on Standard flags"
- "Collecting Premium flags gives 75% permanent discount"
- "This incentivizes collecting higher-tier flags first"
- If user has Plus/Premium, show discounted price on a Standard flag

### 9. Profile Page

**Navigate**: Click "Profile" in header

**Talking Points**:
- "Users can see their complete profile"
- Show reputation score
- Show owned flags
- Show interests
- Show follower/following counts (social feature)

### 10. Rankings

**Navigate**: Click "Rankings" in header

**Talking Points**:
- "Leaderboards show top collectors"
- Switch between tabs:
  - "By Reputation" - points from activities
  - "By Collection" - number of flags owned
  - "Popular Flags" - most interest received
- "This creates competition and engagement"

### 11. Auctions (If Time)

**Navigate**: Click "Auctions" in header

**Talking Points**:
- "Owners can auction their flags to other players"
- "Bids are tracked off-chain for simplicity"
- Show auction card with current bid, time remaining
- "Winner pays in MATIC to receive ownership"

### 12. Admin Panel

**Navigate**: Click "Admin" in header

**Talking Points**:
- "Owners have an admin panel to manage content"
- Enter admin key
- Show statistics dashboard
- Show country management - toggle visibility
- "Can add new countries, regions, municipalities"
- "Can update flag images and metadata"

## Key Demo Messages

1. **Innovation**: "AI-generated NFTs representing real-world locations"
2. **Gamification**: "Pair completion mechanic creates scarcity and urgency"
3. **Economics**: "Discount tiers incentivize strategic collecting"
4. **Social**: "Rankings and following create community engagement"
5. **Scalability**: "Can expand to any country/region/municipality"

## Handling Questions

**Q: Why Polygon?**
A: Low transaction fees make it accessible for small purchases

**Q: How are images generated?**
A: Stable Diffusion AI creates unique heraldic-style flag designs

**Q: What happens to completed pairs?**
A: They're marked complete and removed from active marketplace

**Q: Can flags be traded?**
A: Yes, through the auction system or direct ERC-721 transfers

**Q: How do discounts work on-chain?**
A: Contract tracks Plus/Premium ownership and calculates price automatically

## Post-Demo

- Offer to show code structure
- Explain technical documentation available
- Provide test credentials if client wants to explore
- Answer technical questions about implementation
