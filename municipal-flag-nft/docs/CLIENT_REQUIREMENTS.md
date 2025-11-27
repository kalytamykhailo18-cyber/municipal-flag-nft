# Client Requirements Document

## Project Overview

Project Name: Municipal Flag NFT Game
Type: Functional Demonstration (Not Production)
Deadline: December 10, 2024
Confidentiality: Private repository only - cannot be shared publicly

---

## Client's Goal

The client wants to create a proof-of-concept for a collectible NFT game. This demo will be used to:

1. Show investors or partners how the game concept works
2. Validate the idea before investing in full production
3. Demonstrate the technical feasibility of the game mechanics

This is NOT a finished product for public release. It is a working demonstration to prove the concept works.

---

## The Game Concept

### What is it?

A web-based game where players collect digital flags (NFTs) from real municipalities around the world.

### How does it work?

1. Browse: Players explore flags organized by Country → Region → Municipality
2. Collect: Each flag has 2 NFTs (a pair)
   - First NFT: Free to claim (shows interest)
   - Second NFT: Costs money to buy (completes the collection)
3. Complete: When someone buys the second NFT, the pair is "closed" and removed from the game
4. Earn Discounts: Collecting special flags gives discounts on future purchases

### Flag Categories

| Category | Benefit |
|----------|---------|
| Standard | No special benefit |
| Plus | 50% discount on next Standard flag |
| Premium | 75% permanent discount on all Standard flags |

### Social Features

- See who is interested in each flag
- See who owns each flag
- Rankings (top collectors)
- Auctions (sell flags to other players)
- Follow other players

---

## Client's Specific Requirements

### 1. Demo Content Size

| Item | Quantity |
|------|----------|
| Countries | 4 |
| Regions per country | 1 |
| Municipalities per region | 2 |
| Flags per municipality | 8 |
| Total Flags | 64 |

### 2. Technology Requirements

| Component | Technology | Reason |
|-----------|------------|--------|
| Blockchain | Polygon (testnet) | Low transaction fees |
| Smart Contract | ERC-721 (NFT standard) | Industry standard for NFTs |
| Contract Testing | Hardhat | Client specifically requested this |
| Backend | Python (FastAPI) | Client's choice |
| Frontend | React | Client's choice |
| Images | AI-generated (Stable Diffusion) | Unique flag designs |
| Image Storage | IPFS | Permanent, decentralized storage |

### 3. Admin Panel Requirements

The client needs to easily:
- Show/hide countries, regions, municipalities
- Change which flags are displayed
- View statistics (users, flags claimed, etc.)

### 4. Documentation Requirements

The client specifically requested:
- Technical manual (how the system works)
- Architecture diagram (visual overview)
- Setup instructions (how to run everything)
- Demo script (how to show the product)
- Hardhat test documentation (what each test does, how to run tests)

### 5. Confidentiality Requirements

- Code must stay in private repository
- Cannot be shared publicly
- Copyright assignment to client required

---

## What the Client Does NOT Need (For This Demo)

| Feature | Status | Reason |
|---------|--------|--------|
| Real money transactions | ❌ Not needed | Demo uses test network |
| External social media integration | ❌ Not needed | Internal social system only |
| Mobile app | ❌ Not needed | Web only for demo |
| Production server hosting | ❌ Not needed | Runs locally for demo |
| Thousands of flags | ❌ Not needed | 64 flags enough for demo |

---

## Why the Client Wants This Project

Based on the conversation, the client appears to be:

1. An entrepreneur or business person with a game concept
2. Not a technical person (asked basic questions, needs documentation)
3. Planning to show this to others (needs demo script, clean documentation)
4. Thinking long-term (asked about social media for "later phase")
5. Budget-conscious (chose Polygon for low fees, wants demo not production)

### Likely Use Cases for This Demo:

- Present to investors to raise funding
- Show to potential business partners
- Validate concept before building full version
- Use as specification for future development team

---

## Agreed Deliverables Summary

| Deliverable | Status |
|-------------|--------|
| Working website (React frontend) | ✅ Built |
| Working server (Python backend) | ✅ Built |
| Smart contract with tests | ✅ Built |
| AI image generation script | ✅ Built |
| Admin panel | ✅ Built |
| Technical documentation | ✅ Written |
| Architecture diagram | ✅ Created |
| Setup guide | ✅ Written |
| Demo script | ✅ Written |
| Hardhat test documentation | ✅ Written |

---

## What Remains Before Delivery

| Task | Waiting For |
|------|-------------|
| Deploy smart contract | Client's wallet private key |
| Upload images to IPFS | Client's Pinata API keys |
| Generate AI images | Client's decision (placeholder vs AI) |
| Configure admin password | Client's preferred password |
| Final testing on testnet | Above items completed |

---

## Timeline

| Date | Milestone |
|------|-----------|
| Nov 23 | Contract accepted |
| Nov 26 | Development complete |
| Nov 26 | Progress report sent to client |
| Waiting | Client provides credentials |
| +2-3 days | Configuration and deployment |
| Dec 10 | Final deadline |

Current Status: On track - waiting for client credentials to complete deployment.
