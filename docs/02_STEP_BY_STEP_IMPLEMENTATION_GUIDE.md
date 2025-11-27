# Municipal Flag NFT Game - Step-by-Step Implementation Guide

This guide breaks down the entire project into small, manageable steps. Follow each step in order. Each step is designed to be completed without ambiguity.

---

## Phase 1: Project Setup and Environment

### Step 1.1: Create Project Root Structure
- Create main project folder: `municipal-flag-nft`
- Inside, create these subfolders:
  - `backend/` (FastAPI application)
  - `frontend/` (React application)
  - `contracts/` (Hardhat smart contracts)
  - `ai-generator/` (Stable Diffusion scripts)
  - `docs/` (Documentation)

### Step 1.2: Initialize Backend (FastAPI)
- Navigate to `backend/` folder
- Create Python virtual environment: `python -m venv venv`
- Activate virtual environment
- Create `requirements.txt` with initial dependencies:
  - fastapi
  - uvicorn
  - sqlalchemy
  - python-dotenv
  - web3
  - httpx
  - python-multipart

### Step 1.3: Install Backend Dependencies
- Run: `pip install -r requirements.txt`
- Verify installation by running: `python -c "import fastapi; print('OK')"`

### Step 1.4: Initialize Frontend (React)
- Navigate to `frontend/` folder
- Run: `npx create-react-app . --template typescript` (or without typescript if preferred)
- Verify by running: `npm start` (should open browser with React logo)
- Stop the server after verification

### Step 1.5: Install Frontend Additional Dependencies
- Install these packages:
  - `npm install ethers` (for blockchain interaction)
  - `npm install axios` (for API calls)
  - `npm install react-router-dom` (for navigation)

### Step 1.6: Initialize Hardhat Project
- Navigate to `contracts/` folder
- Run: `npm init -y`
- Run: `npm install --save-dev hardhat`
- Run: `npx hardhat init` (select "Create a JavaScript project")
- Install OpenZeppelin: `npm install @openzeppelin/contracts`

### Step 1.7: Configure Hardhat for Polygon Amoy
- Open `hardhat.config.js`
- Add Polygon Amoy network configuration:
  - Network name: `amoy`
  - RPC URL: `https://rpc-amoy.polygon.technology`
  - Chain ID: `80002`
- Add placeholder for private key (from .env)

### Step 1.8: Create Environment Files
- In `backend/`: create `.env` with placeholders for:
  - DATABASE_URL
  - IPFS_API_KEY
  - IPFS_API_SECRET
  - CONTRACT_ADDRESS (empty for now)
- In `contracts/`: create `.env` with:
  - PRIVATE_KEY (deployer wallet)
  - POLYGONSCAN_API_KEY (for verification)
- In `frontend/`: create `.env` with:
  - REACT_APP_API_URL
  - REACT_APP_CONTRACT_ADDRESS (empty for now)

### Step 1.9: Setup Git Repository (Private)
- Initialize git in project root: `git init`
- Create `.gitignore` with:
  - `node_modules/`
  - `venv/`
  - `.env`
  - `__pycache__/`
  - `artifacts/`
  - `cache/`
- Make first commit: "Initial project structure"

---

## Phase 2: Database Design and Backend Foundation

### Step 2.1: Create Database Schema File
- In `backend/`, create `models.py`
- Define SQLAlchemy base class

### Step 2.2: Create Country Model
- In `models.py`, add Country class:
  - id (integer, primary key)
  - name (string, 100 chars)
  - code (string, 3 chars, e.g., "USA")
  - is_visible (boolean, default True)
  - created_at (datetime)

### Step 2.3: Create Region Model
- In `models.py`, add Region class:
  - id (integer, primary key)
  - name (string, 100 chars)
  - country_id (foreign key to Country)
  - is_visible (boolean, default True)
  - created_at (datetime)

### Step 2.4: Create Municipality Model
- In `models.py`, add Municipality class:
  - id (integer, primary key)
  - name (string, 100 chars)
  - region_id (foreign key to Region)
  - latitude (float)
  - longitude (float)
  - is_visible (boolean, default True)
  - created_at (datetime)

### Step 2.5: Create Flag Model
- In `models.py`, add Flag class:
  - id (integer, primary key)
  - municipality_id (foreign key to Municipality)
  - name (string - will be coordinates)
  - location_type (string - fire station, bakery, etc.)
  - category (enum: STANDARD, PLUS, PREMIUM)
  - image_ipfs_hash (string)
  - metadata_ipfs_hash (string)
  - token_id (integer, nullable - assigned after minting)
  - first_nft_status (enum: AVAILABLE, CLAIMED)
  - second_nft_status (enum: AVAILABLE, PURCHASED)
  - is_pair_complete (boolean, default False)
  - created_at (datetime)

### Step 2.6: Create User Model
- In `models.py`, add User class:
  - id (integer, primary key)
  - wallet_address (string, unique)
  - username (string, optional)
  - reputation_score (integer, default 0)
  - created_at (datetime)

### Step 2.7: Create FlagInterest Model (for first NFT claims)
- In `models.py`, add FlagInterest class:
  - id (integer, primary key)
  - user_id (foreign key to User)
  - flag_id (foreign key to Flag)
  - created_at (datetime)
  - Unique constraint on (user_id, flag_id)

### Step 2.8: Create FlagOwnership Model
- In `models.py`, add FlagOwnership class:
  - id (integer, primary key)
  - user_id (foreign key to User)
  - flag_id (foreign key to Flag)
  - ownership_type (enum: FIRST, SECOND)
  - transaction_hash (string)
  - created_at (datetime)

### Step 2.9: Create UserConnection Model
- In `models.py`, add UserConnection class:
  - id (integer, primary key)
  - follower_id (foreign key to User)
  - following_id (foreign key to User)
  - created_at (datetime)
  - Unique constraint on (follower_id, following_id)

### Step 2.10: Create Auction Model
- In `models.py`, add Auction class:
  - id (integer, primary key)
  - flag_id (foreign key to Flag)
  - seller_id (foreign key to User)
  - starting_price (decimal)
  - current_highest_bid (decimal)
  - highest_bidder_id (foreign key to User, nullable)
  - status (enum: ACTIVE, CLOSED, CANCELLED)
  - ends_at (datetime)
  - created_at (datetime)

### Step 2.11: Create Bid Model
- In `models.py`, add Bid class:
  - id (integer, primary key)
  - auction_id (foreign key to Auction)
  - bidder_id (foreign key to User)
  - amount (decimal)
  - created_at (datetime)

### Step 2.12: Create Database Connection Setup
- In `backend/`, create `database.py`
- Configure SQLAlchemy engine for SQLite: `sqlite:///./nft_game.db`
- Create SessionLocal factory
- Create Base declarative base
- Create function to get database session

### Step 2.13: Create Database Initialization Script
- In `backend/`, create `init_db.py`
- Import all models
- Create all tables using `Base.metadata.create_all()`
- Run the script to verify tables are created

### Step 2.14: Create Main FastAPI Application File
- In `backend/`, create `main.py`
- Initialize FastAPI app
- Add CORS middleware (allow React frontend origin)
- Add health check endpoint: `GET /health` returns `{"status": "ok"}`

### Step 2.15: Test Backend Startup
- Run: `uvicorn main:app --reload`
- Visit: `http://localhost:8000/health`
- Verify response: `{"status": "ok"}`
- Visit: `http://localhost:8000/docs` (Swagger UI should appear)

---

## Phase 3: Backend API Endpoints

### Step 3.1: Create Schemas File
- In `backend/`, create `schemas.py`
- Define Pydantic models for request/response:
  - CountryCreate, CountryResponse
  - RegionCreate, RegionResponse
  - MunicipalityCreate, MunicipalityResponse
  - FlagCreate, FlagResponse

### Step 3.2: Create Countries Router
- In `backend/`, create folder `routers/`
- Create `routers/countries.py`
- Add endpoint: `GET /countries` - list all visible countries
- Add endpoint: `GET /countries/{id}` - get single country
- Add endpoint: `POST /countries` - create country (admin)
- Add endpoint: `PUT /countries/{id}` - update country (admin)
- Add endpoint: `DELETE /countries/{id}` - delete country (admin)

### Step 3.3: Register Countries Router
- In `main.py`, import countries router
- Add router with prefix `/api/countries`
- Test `GET /api/countries` returns empty list

### Step 3.4: Create Regions Router
- Create `routers/regions.py`
- Add endpoint: `GET /regions` - list all regions (optional filter by country_id)
- Add endpoint: `GET /regions/{id}` - get single region with municipalities
- Add endpoint: `POST /regions` - create region (admin)
- Add endpoint: `PUT /regions/{id}` - update region (admin)
- Add endpoint: `DELETE /regions/{id}` - delete region (admin)

### Step 3.5: Register Regions Router
- In `main.py`, import and add regions router
- Prefix: `/api/regions`

### Step 3.6: Create Municipalities Router
- Create `routers/municipalities.py`
- Add endpoint: `GET /municipalities` - list all (optional filter by region_id)
- Add endpoint: `GET /municipalities/{id}` - get single with flags
- Add endpoint: `POST /municipalities` - create (admin)
- Add endpoint: `PUT /municipalities/{id}` - update (admin)
- Add endpoint: `DELETE /municipalities/{id}` - delete (admin)

### Step 3.7: Register Municipalities Router
- In `main.py`, import and add municipalities router
- Prefix: `/api/municipalities`

### Step 3.8: Create Flags Router
- Create `routers/flags.py`
- Add endpoint: `GET /flags` - list all flags (optional filter by municipality_id)
- Add endpoint: `GET /flags/{id}` - get single flag with interests and ownership
- Add endpoint: `POST /flags` - create flag (admin)
- Add endpoint: `PUT /flags/{id}` - update flag (admin)

### Step 3.9: Add Flag Interest Endpoints
- In `routers/flags.py`:
- Add endpoint: `POST /flags/{id}/interest` - register user interest (first NFT)
  - Body: `{"wallet_address": "0x..."}`
  - Creates user if not exists
  - Creates interest record
- Add endpoint: `GET /flags/{id}/interests` - list all interested users

### Step 3.10: Register Flags Router
- In `main.py`, import and add flags router
- Prefix: `/api/flags`

### Step 3.11: Create Users Router
- Create `routers/users.py`
- Add endpoint: `GET /users/{wallet_address}` - get user profile
- Add endpoint: `POST /users` - create/get user by wallet
- Add endpoint: `GET /users/{wallet_address}/flags` - user's owned flags
- Add endpoint: `GET /users/{wallet_address}/interests` - user's interests

### Step 3.12: Add User Connection Endpoints
- In `routers/users.py`:
- Add endpoint: `POST /users/{wallet}/follow` - follow another user
  - Body: `{"target_wallet": "0x..."}`
- Add endpoint: `DELETE /users/{wallet}/follow/{target_wallet}` - unfollow
- Add endpoint: `GET /users/{wallet}/followers` - list followers
- Add endpoint: `GET /users/{wallet}/following` - list following

### Step 3.13: Register Users Router
- In `main.py`, import and add users router
- Prefix: `/api/users`

### Step 3.14: Create Auctions Router
- Create `routers/auctions.py`
- Add endpoint: `GET /auctions` - list active auctions
- Add endpoint: `GET /auctions/{id}` - get auction details with bid history
- Add endpoint: `POST /auctions` - create auction (requires ownership)
  - Body: `{"flag_id": 1, "starting_price": 0.1, "duration_hours": 24}`
- Add endpoint: `POST /auctions/{id}/bid` - place bid
  - Body: `{"wallet_address": "0x...", "amount": 0.15}`

### Step 3.15: Add Auction Close Logic
- In `routers/auctions.py`:
- Add endpoint: `POST /auctions/{id}/close` - close auction (admin/owner)
- Implement winner determination logic
- Update ownership records

### Step 3.16: Register Auctions Router
- In `main.py`, import and add auctions router
- Prefix: `/api/auctions`

### Step 3.17: Create Rankings Router
- Create `routers/rankings.py`
- Add endpoint: `GET /rankings/users` - top users by reputation
- Add endpoint: `GET /rankings/collectors` - top users by flags owned
- Add endpoint: `GET /rankings/flags` - most popular flags (by interests)

### Step 3.18: Register Rankings Router
- In `main.py`, import and add rankings router
- Prefix: `/api/rankings`

### Step 3.19: Create Admin Router
- Create `routers/admin.py`
- Add endpoint: `GET /admin/stats` - overall statistics
- Add endpoint: `POST /admin/seed` - seed demo data (if empty)
- Add simple authentication check (API key in header for demo)

### Step 3.20: Register Admin Router
- In `main.py`, import and add admin router
- Prefix: `/api/admin`

### Step 3.21: Test All Endpoints
- Use Swagger UI at `/docs`
- Test each endpoint manually
- Verify error handling works

---

## Phase 4: Smart Contract Development

### Step 4.1: Create Contract File
- In `contracts/contracts/`, create `MunicipalFlagNFT.sol`
- Add SPDX license identifier
- Add Solidity version pragma (^0.8.20)
- Import OpenZeppelin ERC721 and Ownable

### Step 4.2: Define Contract Structure
- Create contract `MunicipalFlagNFT` inheriting from ERC721, Ownable
- Define state variables:
  - `_tokenIdCounter` (uint256)
  - `baseURI` (string)

### Step 4.3: Define Flag Struct
- Create struct `FlagPair`:
  - flagId (uint256)
  - firstTokenId (uint256)
  - secondTokenId (uint256)
  - firstMinted (bool)
  - secondMinted (bool)
  - pairComplete (bool)
  - category (uint8: 0=Standard, 1=Plus, 2=Premium)

### Step 4.4: Define Mappings
- Add mapping: `flagPairs` (uint256 flagId => FlagPair)
- Add mapping: `tokenToFlag` (uint256 tokenId => uint256 flagId)
- Add mapping: `flagPrices` (uint256 flagId => uint256 price)

### Step 4.5: Create Constructor
- Set name: "Municipal Flag NFT"
- Set symbol: "MFLAG"
- Set initial owner (msg.sender)

### Step 4.6: Create Admin Function - Register Flag
- Function: `registerFlag(uint256 flagId, uint8 category, uint256 price)`
- Only owner can call
- Create new FlagPair struct
- Set price
- Emit event: `FlagRegistered(flagId, category, price)`

### Step 4.7: Create Function - Mint First NFT (Free)
- Function: `claimFirstNFT(uint256 flagId)`
- Check flag exists
- Check firstMinted is false
- Mint token to msg.sender
- Update FlagPair.firstMinted = true
- Update FlagPair.firstTokenId
- Emit event: `FirstNFTClaimed(flagId, tokenId, msg.sender)`

### Step 4.8: Create Function - Purchase Second NFT
- Function: `purchaseSecondNFT(uint256 flagId)` payable
- Check flag exists
- Check firstMinted is true (first must be claimed)
- Check secondMinted is false
- Check msg.value >= price
- Mint token to msg.sender
- Update FlagPair.secondMinted = true
- Update FlagPair.secondTokenId
- Update FlagPair.pairComplete = true
- Emit event: `SecondNFTPurchased(flagId, tokenId, msg.sender)`
- Emit event: `PairCompleted(flagId)`

### Step 4.9: Create Function - Get Flag Info
- Function: `getFlagPair(uint256 flagId)` view returns (FlagPair memory)
- Return the FlagPair struct

### Step 4.10: Create Function - Get Price with Discount
- Function: `getPriceWithDiscount(uint256 flagId, address buyer)` view returns (uint256)
- Check if buyer owns any Plus NFT (50% discount)
- Check if buyer owns any Premium NFT (75% discount)
- Return discounted price

### Step 4.11: Create Function - Set Base URI
- Function: `setBaseURI(string memory newBaseURI)` onlyOwner
- Update baseURI variable

### Step 4.12: Override tokenURI Function
- Override `tokenURI(uint256 tokenId)`
- Return: `baseURI + tokenId.toString() + ".json"`

### Step 4.13: Create Withdraw Function
- Function: `withdraw()` onlyOwner
- Transfer contract balance to owner

### Step 4.14: Create Events
- Event: `FlagRegistered(uint256 indexed flagId, uint8 category, uint256 price)`
- Event: `FirstNFTClaimed(uint256 indexed flagId, uint256 tokenId, address indexed claimer)`
- Event: `SecondNFTPurchased(uint256 indexed flagId, uint256 tokenId, address indexed buyer)`
- Event: `PairCompleted(uint256 indexed flagId)`

### Step 4.15: Compile Contract
- Run: `npx hardhat compile`
- Fix any compilation errors
- Verify artifacts are generated in `artifacts/`

---

## Phase 5: Smart Contract Testing

### Step 5.1: Create Test File
- In `contracts/test/`, create `MunicipalFlagNFT.test.js`
- Import Hardhat test utilities (expect, ethers)
- Import contract factory

### Step 5.2: Write Deployment Test
- Test: "Should deploy successfully"
- Deploy contract
- Verify owner is deployer address
- Verify name is "Municipal Flag NFT"
- Verify symbol is "MFLAG"

### Step 5.3: Write Register Flag Test
- Test: "Owner can register a flag"
- Register flag with ID 1, category 0, price 0.01 ETH
- Verify FlagPair exists
- Verify event emitted

### Step 5.4: Write Non-Owner Cannot Register Test
- Test: "Non-owner cannot register flag"
- Try to register from non-owner account
- Expect revert with "OwnableUnauthorizedAccount"

### Step 5.5: Write First NFT Claim Test
- Test: "User can claim first NFT for free"
- Register a flag
- Claim first NFT from user account
- Verify user owns token
- Verify FlagPair.firstMinted is true

### Step 5.6: Write Double Claim Prevention Test
- Test: "Cannot claim first NFT twice"
- Register and claim first NFT
- Try to claim again
- Expect revert

### Step 5.7: Write Second NFT Purchase Test
- Test: "User can purchase second NFT"
- Register flag, claim first
- Purchase second with correct price
- Verify user owns second token
- Verify pairComplete is true

### Step 5.8: Write Insufficient Payment Test
- Test: "Cannot purchase with insufficient payment"
- Register flag, claim first
- Try to purchase with less than price
- Expect revert

### Step 5.9: Write Purchase Before Claim Test
- Test: "Cannot purchase second before first is claimed"
- Register flag
- Try to purchase second
- Expect revert

### Step 5.10: Write Discount Calculation Test
- Test: "Plus owner gets 50% discount"
- Create Plus flag, user claims and purchases
- Verify discount on subsequent Standard purchase

### Step 5.11: Write Withdrawal Test
- Test: "Owner can withdraw funds"
- Register flag, purchase to add funds
- Owner withdraws
- Verify owner balance increased

### Step 5.12: Run All Tests
- Run: `npx hardhat test`
- Verify all tests pass
- Fix any failing tests

### Step 5.13: Create Test Documentation
- Create `contracts/TEST_DOCUMENTATION.md`
- Document each test: what it validates
- Document how to run: `npx hardhat test`
- Document prerequisites
- Include sample output

---

## Phase 6: Contract Deployment

### Step 6.1: Get Polygon Amoy Testnet MATIC
- Go to Polygon Amoy Faucet (faucet.polygon.technology)
- Connect wallet
- Request test MATIC
- Verify balance in MetaMask

### Step 6.2: Create Deployment Script
- In `contracts/scripts/`, create `deploy.js`
- Get deployer signer
- Deploy MunicipalFlagNFT contract
- Log deployed contract address
- Wait for deployment confirmation

### Step 6.3: Deploy to Local Hardhat Network First
- Run: `npx hardhat node` (in separate terminal)
- Run: `npx hardhat run scripts/deploy.js --network localhost`
- Verify deployment works locally
- Note the local contract address

### Step 6.4: Deploy to Polygon Amoy
- Ensure .env has PRIVATE_KEY set
- Run: `npx hardhat run scripts/deploy.js --network amoy`
- Save the deployed contract address
- Record transaction hash

### Step 6.5: Verify Contract on PolygonScan (Optional)
- Run: `npx hardhat verify --network amoy DEPLOYED_ADDRESS`
- Check verification on amoy.polygonscan.com

### Step 6.6: Update Environment Files
- Update `backend/.env` with CONTRACT_ADDRESS
- Update `frontend/.env` with REACT_APP_CONTRACT_ADDRESS
- Commit these changes (without actual address values)

### Step 6.7: Create Contract ABI Export
- Copy ABI from `artifacts/contracts/MunicipalFlagNFT.sol/MunicipalFlagNFT.json`
- Extract only the "abi" array
- Save to `frontend/src/contracts/MunicipalFlagNFT.json`
- Save to `backend/contracts/MunicipalFlagNFT.json`

---

## Phase 7: AI Image Generation

### Step 7.1: Setup AI Generator Environment
- Navigate to `ai-generator/` folder
- Create virtual environment
- Create `requirements.txt`:
  - diffusers
  - torch
  - transformers
  - Pillow
  - requests

### Step 7.2: Install AI Dependencies
- Run: `pip install -r requirements.txt`
- Note: This requires significant disk space and GPU for best performance

### Step 7.3: Create Image Generation Script
- Create `ai-generator/generate_flags.py`
- Import required libraries (diffusers, PIL)
- Load Stable Diffusion pipeline

### Step 7.4: Define Municipality Data
- Create `ai-generator/municipalities.json`
- Define 4 countries with names and codes
- Define 1 region per country
- Define 2 municipalities per region
- Include coordinates for each municipality

### Step 7.5: Create Base Prompt Template
- Define base prompt for flag generation:
  - "A heraldic municipal flag design for [municipality], [region], [country], featuring [location_type], in traditional heraldic style, symmetrical design, vibrant colors, coat of arms elements"

### Step 7.6: Create Variation Prompts
- Create 8 location types for each municipality:
  - Fire station
  - Bakery
  - Town hall
  - Church
  - Market square
  - Fountain
  - Bridge
  - Park

### Step 7.7: Implement Generation Loop
- For each country:
  - For each region:
    - For each municipality:
      - Generate base image
      - For each of 8 location types:
        - Generate flag variation using img2img

### Step 7.8: Save Generated Images
- Save images to `ai-generator/output/`
- Naming convention: `{country_code}_{region_id}_{municipality_id}_{flag_num}.png`
- Total: 64 images (4 countries × 1 region × 2 municipalities × 8 flags)

### Step 7.9: Alternative: Use Cloud API
- If local generation is too slow:
- Create `ai-generator/generate_via_api.py`
- Use Replicate or Stability AI API
- Same logic but via HTTP calls

### Step 7.10: Run Generation
- Execute: `python generate_flags.py`
- Monitor progress (64 images may take time)
- Verify all 64 images are generated

### Step 7.11: Review Generated Images
- Open output folder
- Visually inspect images
- Regenerate any poor quality ones if needed

---

## Phase 8: IPFS Upload

### Step 8.1: Setup Pinata Account
- Go to pinata.cloud
- Create free account
- Get API key and secret
- Add to backend `.env`

### Step 8.2: Create IPFS Upload Script
- In `backend/`, create `ipfs_upload.py`
- Import Pinata SDK or use HTTP API
- Function: `upload_file(filepath)` returns IPFS hash
- Function: `upload_json(data)` returns IPFS hash

### Step 8.3: Create Metadata Template
- Define NFT metadata structure:
  ```json
  {
    "name": "Flag at [coordinates]",
    "description": "[location_type] flag of [municipality], [region], [country]",
    "image": "ipfs://[image_hash]",
    "attributes": [
      {"trait_type": "Country", "value": "..."},
      {"trait_type": "Region", "value": "..."},
      {"trait_type": "Municipality", "value": "..."},
      {"trait_type": "Location Type", "value": "..."},
      {"trait_type": "Category", "value": "Standard/Plus/Premium"},
      {"trait_type": "Coordinates", "value": "lat,long"}
    ]
  }
  ```

### Step 8.4: Create Batch Upload Script
- Create `backend/upload_all_to_ipfs.py`
- Read all images from `ai-generator/output/`
- For each image:
  - Upload image to IPFS
  - Create metadata JSON with image hash
  - Upload metadata to IPFS
  - Save mapping: filename → image_hash, metadata_hash

### Step 8.5: Run Upload Script
- Execute upload script
- Save results to `backend/ipfs_mapping.json`
- This may take time (64 images + 64 metadata files)

### Step 8.6: Verify Uploads
- Check a few IPFS hashes via gateway:
  - `https://gateway.pinata.cloud/ipfs/{hash}`
- Verify images display correctly
- Verify metadata JSON is valid

---

## Phase 9: Seed Database with Demo Data

### Step 9.1: Create Seed Script
- In `backend/`, create `seed_data.py`
- Import database session and models
- Import IPFS mapping JSON

### Step 9.2: Seed Countries
- Insert 4 countries:
  - Spain (ESP)
  - France (FRA)
  - Germany (DEU)
  - Italy (ITA)

### Step 9.3: Seed Regions
- Insert 4 regions (1 per country):
  - Catalonia (Spain)
  - Provence (France)
  - Bavaria (Germany)
  - Tuscany (Italy)

### Step 9.4: Seed Municipalities
- Insert 8 municipalities (2 per region):
  - Barcelona, Girona (Catalonia)
  - Marseille, Nice (Provence)
  - Munich, Nuremberg (Bavaria)
  - Florence, Siena (Tuscany)
- Include coordinates for each

### Step 9.5: Seed Flags
- Insert 64 flags (8 per municipality)
- For each flag:
  - Set name as coordinates
  - Set location_type
  - Randomly assign category (60% Standard, 30% Plus, 10% Premium)
  - Set IPFS hashes from mapping

### Step 9.6: Run Seed Script
- Execute: `python seed_data.py`
- Verify data in database

### Step 9.7: Test API with Seeded Data
- Call `GET /api/countries` - should return 4 countries
- Call `GET /api/flags` - should return 64 flags
- Verify IPFS images load

---

## Phase 10: Frontend Development - Structure

### Step 10.1: Clean Default React Files
- Remove default App.css content
- Remove logo.svg
- Clear App.js/App.tsx to minimal component

### Step 10.2: Create Folder Structure
- Create `src/components/` - reusable components
- Create `src/pages/` - page components
- Create `src/services/` - API calls
- Create `src/context/` - React context
- Create `src/contracts/` - ABI files
- Create `src/utils/` - utility functions

### Step 10.3: Setup React Router
- In `App.js`, import BrowserRouter, Routes, Route
- Define route structure:
  - `/` - Home/Landing
  - `/countries` - Country list
  - `/countries/:id` - Country detail with regions
  - `/regions/:id` - Region detail with municipalities
  - `/municipalities/:id` - Municipality with flags
  - `/flags/:id` - Flag detail
  - `/profile` - User profile
  - `/auctions` - Auction list
  - `/rankings` - Rankings page
  - `/admin` - Admin panel

### Step 10.4: Create API Service
- In `src/services/`, create `api.js`
- Configure axios with base URL from env
- Create functions:
  - `getCountries()`
  - `getCountry(id)`
  - `getRegions(countryId)`
  - `getMunicipalities(regionId)`
  - `getFlags(municipalityId)`
  - `getFlag(id)`
  - etc.

### Step 10.5: Create Web3 Service
- In `src/services/`, create `web3.js`
- Import ethers
- Import contract ABI
- Function: `connectWallet()` - returns signer and address
- Function: `getContract(signer)` - returns contract instance
- Function: `claimFirstNFT(flagId)`
- Function: `purchaseSecondNFT(flagId, price)`

### Step 10.6: Create Wallet Context
- In `src/context/`, create `WalletContext.js`
- Store: connected, address, signer, balance
- Actions: connect, disconnect
- Provide to entire app

---

## Phase 11: Frontend Development - Components

### Step 11.1: Create Header Component
- Create `src/components/Header.js`
- Display logo/title
- Navigation links
- Connect Wallet button
- Show connected address (truncated)

### Step 11.2: Create Footer Component
- Create `src/components/Footer.js`
- Copyright text
- Links to demo info

### Step 11.3: Create Layout Component
- Create `src/components/Layout.js`
- Include Header
- Main content area (children)
- Include Footer

### Step 11.4: Create CountryCard Component
- Create `src/components/CountryCard.js`
- Display country name and code
- Flag icon (can use emoji)
- Region count
- Link to country detail

### Step 11.5: Create RegionCard Component
- Create `src/components/RegionCard.js`
- Display region name
- Parent country
- Municipality count
- Link to region detail

### Step 11.6: Create MunicipalityCard Component
- Create `src/components/MunicipalityCard.js`
- Display municipality name
- Coordinates
- Flag count
- Completion percentage
- Link to municipality detail

### Step 11.7: Create FlagCard Component
- Create `src/components/FlagCard.js`
- Display flag image (from IPFS)
- Flag name (coordinates)
- Location type
- Category badge (Standard/Plus/Premium)
- Status indicator (Available/Claimed/Complete)
- Link to flag detail

### Step 11.8: Create UserCard Component
- Create `src/components/UserCard.js`
- Display wallet address (truncated)
- Username if set
- Reputation score
- Flags owned count
- Follow button

### Step 11.9: Create AuctionCard Component
- Create `src/components/AuctionCard.js`
- Display flag image
- Current highest bid
- Time remaining
- Bid button
- Link to auction detail

### Step 11.10: Create Loading Component
- Create `src/components/Loading.js`
- Simple spinner or skeleton
- Loading text

### Step 11.11: Create Error Component
- Create `src/components/Error.js`
- Error message display
- Retry button

---

## Phase 12: Frontend Development - Pages

### Step 12.1: Create Home Page
- Create `src/pages/Home.js`
- Hero section with game description
- Quick stats (total flags, users, etc.)
- Featured flags section
- CTA to explore countries

### Step 12.2: Create Countries Page
- Create `src/pages/Countries.js`
- Fetch and display all countries
- Grid of CountryCard components
- Search/filter if needed

### Step 12.3: Create Country Detail Page
- Create `src/pages/CountryDetail.js`
- Fetch country by ID from URL params
- Display country info
- List of regions (RegionCard components)

### Step 12.4: Create Region Detail Page
- Create `src/pages/RegionDetail.js`
- Fetch region by ID
- Display region info with breadcrumb
- List of municipalities (MunicipalityCard components)

### Step 12.5: Create Municipality Detail Page
- Create `src/pages/MunicipalityDetail.js`
- Fetch municipality by ID
- Display info with full breadcrumb
- Grid of all 8 flags (FlagCard components)
- Filter by category/status

### Step 12.6: Create Flag Detail Page
- Create `src/pages/FlagDetail.js`
- Fetch flag by ID
- Large flag image
- All metadata displayed
- Interested users list
- Current owner (if claimed)
- Action buttons:
  - "Show Interest" (if available)
  - "Claim First NFT" (if available, wallet connected)
  - "Purchase Second NFT" (if first claimed, with price)

### Step 12.7: Implement Flag Interest Action
- In Flag Detail page
- On "Show Interest" click:
  - Call `POST /api/flags/{id}/interest`
  - Update UI to show user in list

### Step 12.8: Implement Claim First NFT Action
- In Flag Detail page
- On "Claim First NFT" click:
  - Check wallet connected
  - Call contract `claimFirstNFT(flagId)`
  - Wait for transaction
  - Update backend with ownership
  - Refresh UI

### Step 12.9: Implement Purchase Second NFT Action
- In Flag Detail page
- On "Purchase" click:
  - Check wallet connected
  - Get price (with discount if applicable)
  - Call contract `purchaseSecondNFT(flagId)` with value
  - Wait for transaction
  - Update backend
  - Refresh UI (show pair complete)

### Step 12.10: Create Profile Page
- Create `src/pages/Profile.js`
- Require wallet connection
- Display user's wallet address
- Option to set username
- List of owned flags
- List of interests
- Followers/following counts
- Reputation score

### Step 12.11: Create Auctions Page
- Create `src/pages/Auctions.js`
- Fetch active auctions
- Grid of AuctionCard components
- Filter by category/ending soon

### Step 12.12: Create Auction Detail Page
- Create `src/pages/AuctionDetail.js`
- Fetch auction by ID
- Flag image and info
- Current bid info
- Bid history list
- Place bid form (input + button)
- Countdown timer

### Step 12.13: Implement Place Bid Action
- In Auction Detail page
- On bid submit:
  - Validate bid > current highest
  - Call `POST /api/auctions/{id}/bid`
  - Refresh auction data

### Step 12.14: Create Rankings Page
- Create `src/pages/Rankings.js`
- Tabs: Users / Collectors / Popular Flags
- Fetch and display appropriate ranking
- Numbered list with UserCard or FlagCard

### Step 12.15: Create Admin Page
- Create `src/pages/Admin.js`
- Require admin API key (simple input)
- Sections:
  - Countries CRUD
  - Regions CRUD
  - Municipalities CRUD
  - Flags management
  - Statistics

### Step 12.16: Implement Admin Countries CRUD
- In Admin page, Countries section:
- List all countries with Edit/Delete buttons
- Add Country form
- Edit modal
- Toggle visibility

### Step 12.17: Implement Admin Regions CRUD
- Same pattern as Countries
- Dropdown to select parent country

### Step 12.18: Implement Admin Municipalities CRUD
- Same pattern
- Dropdown for parent region
- Coordinate inputs

### Step 12.19: Implement Admin Flags Management
- List flags by municipality
- Edit image/metadata
- Change category
- View statistics per flag

---

## Phase 13: Frontend Styling

### Step 13.1: Choose Styling Approach
- Option A: Plain CSS with CSS modules
- Option B: Tailwind CSS
- Option C: Styled Components
- For demo: Use plain CSS for simplicity

### Step 13.2: Create Global Styles
- Create `src/styles/global.css`
- Set base font family
- Reset margins/padding
- Define color variables:
  - Primary color
  - Secondary color
  - Background colors
  - Text colors

### Step 13.3: Style Header Component
- Navigation layout (flexbox)
- Logo styling
- Nav links styling
- Wallet button styling
- Connected state styling

### Step 13.4: Style Card Components
- Consistent card styling
- Border radius
- Shadow
- Hover effects
- Image sizing

### Step 13.5: Style Page Layouts
- Container max-width
- Responsive grid for cards
- Spacing between elements
- Breadcrumb styling

### Step 13.6: Style Form Elements
- Input fields
- Buttons (primary, secondary, disabled)
- Form layout

### Step 13.7: Style Flag Detail Page
- Large image display
- Metadata layout
- Action buttons prominent
- User lists styling

### Step 13.8: Style Admin Panel
- Table layouts
- Form sections
- Tab navigation
- Action buttons

### Step 13.9: Add Responsive Design
- Mobile breakpoint (< 768px)
- Tablet breakpoint (< 1024px)
- Adjust grid columns
- Stack navigation on mobile

### Step 13.10: Add Loading States
- Skeleton loading for cards
- Button loading spinner
- Page loading indicator

---

## Phase 14: Integration Testing

### Step 14.1: Test Wallet Connection
- Open frontend in browser
- Click Connect Wallet
- MetaMask popup appears
- Select account
- Address shows in header

### Step 14.2: Test Navigation Flow
- Navigate: Home → Countries → Country → Region → Municipality → Flag
- Verify breadcrumbs work
- Verify back navigation

### Step 14.3: Test Interest Registration
- Connect wallet
- Go to available flag
- Click "Show Interest"
- Verify appears in interested list

### Step 14.4: Test First NFT Claim
- Connect wallet with testnet MATIC
- Go to flag with no claims
- Click "Claim First NFT"
- Approve MetaMask transaction
- Wait for confirmation
- Verify ownership updated

### Step 14.5: Test Second NFT Purchase
- Find flag with first NFT claimed
- Click "Purchase Second NFT"
- Verify price displayed
- Approve MetaMask transaction
- Wait for confirmation
- Verify pair marked complete

### Step 14.6: Test Profile Page
- Navigate to Profile
- Verify owned flags appear
- Verify interests appear

### Step 14.7: Test Auction Creation
- As flag owner, create auction
- Verify appears in auction list

### Step 14.8: Test Bidding
- View auction
- Place bid
- Verify bid recorded
- Verify new highest bid shown

### Step 14.9: Test Rankings
- View each ranking tab
- Verify data displays correctly

### Step 14.10: Test Admin Panel
- Enter admin key
- Add new country
- Edit region visibility
- Verify changes in frontend

### Step 14.11: Test Multiple Users
- Use different browser/wallet
- Register interest in same flag
- Verify both users shown

### Step 14.12: Fix Any Issues Found
- Document bugs
- Fix each issue
- Re-test

---

## Phase 15: Documentation

### Step 15.1: Create README.md
- In project root, create `README.md`
- Project title and description
- Quick start guide
- Link to detailed docs

### Step 15.2: Create Architecture Diagram
- Use tool (draw.io, Mermaid, etc.)
- Show components:
  - Frontend (React)
  - Backend (FastAPI)
  - Database (SQLite)
  - Smart Contract (Polygon)
  - IPFS (Pinata)
  - Stable Diffusion
- Show data flow between components
- Save as image and include in docs

### Step 15.3: Write Backend Technical Manual
- Create `docs/BACKEND.md`
- API endpoint documentation
- Database schema
- Environment variables
- How to run locally
- How to run tests

### Step 15.4: Write Frontend Technical Manual
- Create `docs/FRONTEND.md`
- Component structure
- Page descriptions
- State management
- Environment variables
- How to run locally
- How to build for production

### Step 15.5: Write Smart Contract Technical Manual
- Create `docs/CONTRACTS.md`
- Contract functions
- Events
- Deployment process
- How to run tests
- How to verify on explorer

### Step 15.6: Write Setup Instructions
- Create `docs/SETUP.md`
- Prerequisites (Node, Python, MetaMask)
- Step-by-step setup for each component
- Environment variable configuration
- Database setup
- Running the full system

### Step 15.7: Write Wallet Connection Guide
- Create `docs/WALLET_GUIDE.md`
- MetaMask installation
- Adding Polygon Amoy network
- Getting test MATIC
- Connecting to application

### Step 15.8: Write Demo Script
- Create `docs/DEMO_SCRIPT.md`
- Pre-demo checklist
- Step-by-step demo flow:
  1. Show home page
  2. Navigate geographic hierarchy
  3. Claim a flag
  4. Complete a pair
  5. Show social features
  6. Show rankings
  7. Admin panel demo
- Talking points for each step

### Step 15.9: Write Hardhat Test Documentation
- Create `contracts/TEST_DOCUMENTATION.md` (if not done earlier)
- List all tests with descriptions
- Prerequisites
- How to run
- Expected output example

### Step 15.10: Compile Final Documentation Package
- Create `docs/INDEX.md` linking all docs
- Review all documentation for completeness
- Add any missing sections

---

## Phase 16: Final Review and Delivery

### Step 16.1: Code Cleanup
- Remove console.log statements
- Remove commented code
- Ensure consistent formatting

### Step 16.2: Add Code Comments
- Add comments to complex functions
- Ensure contract has NatSpec comments
- Document non-obvious logic

### Step 16.3: Run Final Tests
- Run Hardhat tests: all pass
- Test frontend manually: all flows work
- Test backend endpoints: all respond correctly

### Step 16.4: Security Review
- Check for exposed secrets
- Verify .env files not committed
- Review contract for vulnerabilities

### Step 16.5: Create Deployment Checklist
- Create `docs/DEPLOYMENT_CHECKLIST.md`
- List all steps to deploy demo
- Include all addresses and configurations

### Step 16.6: Prepare Demo Environment
- Ensure testnet contract deployed
- Ensure IPFS images accessible
- Seed database with demo data
- Pre-fund demo wallet with MATIC

### Step 16.7: Record Demo Video (Optional)
- If requested, record walkthrough video
- Show all main features
- Keep under 10 minutes

### Step 16.8: Create Delivery Package
- Ensure all code is committed
- Create zip/tar of project (excluding node_modules, venv)
- Include all documentation
- Include architecture diagram
- Include IPFS mapping

### Step 16.9: Final Review with Checklist
- [ ] Smart contract deployed to Polygon Amoy
- [ ] All 64 flag images on IPFS
- [ ] All metadata on IPFS
- [ ] Backend running with all endpoints
- [ ] Frontend running with all pages
- [ ] Admin panel functional
- [ ] Documentation complete
- [ ] Test documentation complete
- [ ] No secrets in code
- [ ] Private repository (not public)

### Step 16.10: Deliver to Client
- Send project files
- Send documentation
- Provide demo walkthrough
- Answer any questions

---

## Summary Checklist

### Phase 1: Project Setup ✓
- [ ] Project structure created
- [ ] Backend initialized (FastAPI)
- [ ] Frontend initialized (React)
- [ ] Hardhat initialized
- [ ] Environment files created
- [ ] Git repository initialized

### Phase 2: Database ✓
- [ ] All models defined
- [ ] Database connection setup
- [ ] Tables created

### Phase 3: Backend API ✓
- [ ] Countries CRUD
- [ ] Regions CRUD
- [ ] Municipalities CRUD
- [ ] Flags CRUD + Interest
- [ ] Users + Connections
- [ ] Auctions + Bids
- [ ] Rankings
- [ ] Admin endpoints

### Phase 4: Smart Contract ✓
- [ ] Contract written
- [ ] All functions implemented
- [ ] Events defined
- [ ] Compiles successfully

### Phase 5: Contract Testing ✓
- [ ] All tests written
- [ ] All tests pass
- [ ] Test documentation created

### Phase 6: Deployment ✓
- [ ] Local deployment tested
- [ ] Polygon Amoy deployment done
- [ ] Contract address saved
- [ ] ABI exported

### Phase 7: AI Generation ✓
- [ ] Generation script created
- [ ] All 64 images generated
- [ ] Images reviewed

### Phase 8: IPFS Upload ✓
- [ ] Pinata configured
- [ ] All images uploaded
- [ ] All metadata uploaded
- [ ] Mapping saved

### Phase 9: Seed Data ✓
- [ ] Seed script created
- [ ] Demo data seeded
- [ ] API verified with data

### Phase 10-12: Frontend ✓
- [ ] Structure created
- [ ] All components built
- [ ] All pages built
- [ ] All actions implemented

### Phase 13: Styling ✓
- [ ] Global styles
- [ ] Component styles
- [ ] Responsive design

### Phase 14: Testing ✓
- [ ] All flows tested
- [ ] Issues fixed

### Phase 15: Documentation ✓
- [ ] Architecture diagram
- [ ] Backend manual
- [ ] Frontend manual
- [ ] Contract manual
- [ ] Setup guide
- [ ] Wallet guide
- [ ] Demo script
- [ ] Test documentation

### Phase 16: Delivery ✓
- [ ] Code cleaned
- [ ] Final tests passed
- [ ] Security reviewed
- [ ] Package prepared
- [ ] Delivered

---

**Total Estimated Steps: ~160 small steps across 16 phases**

Each step is designed to be:
- Small and focused
- Completable in 15-60 minutes
- Clear with no ambiguity
- Testable/verifiable before moving on
