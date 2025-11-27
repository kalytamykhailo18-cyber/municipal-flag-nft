# Municipal Flag NFT Game - Complete Setup Guide

This guide walks you through setting up and running the Municipal Flag NFT Game from scratch on a new machine (Windows/Linux/Mac).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Phase 1: Clone & Configure](#phase-1-clone--configure)
4. [Phase 2: Backend Setup](#phase-2-backend-setup)
5. [Phase 3: Frontend Setup](#phase-3-frontend-setup)
6. [Phase 4: Smart Contract Deployment](#phase-4-smart-contract-deployment)
7. [Phase 5: Database Seeding](#phase-5-database-seeding)
8. [Phase 6: AI Image Generation](#phase-6-ai-image-generation)
9. [Phase 7: IPFS Upload](#phase-7-ipfs-upload)
10. [Phase 8: Running the Application](#phase-8-running-the-application)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install the following before starting:

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | https://nodejs.org/ |
| Python | 3.10+ | https://www.python.org/ |
| Git | Latest | https://git-scm.com/ |
| MetaMask | Browser Extension | https://metamask.io/ |

### Verify Installations

```bash
node --version    # Should be v18+
npm --version     # Should be v9+
python --version  # Should be 3.10+
git --version
```

### Required Accounts

1. **Pinata** (IPFS storage): https://pinata.cloud - Get API keys
2. **PolygonScan** (contract verification): https://polygonscan.com - Get API key
3. **MetaMask Wallet** with Polygon Amoy testnet MATIC (get from faucet: https://faucet.polygon.technology/)

### Optional (for AI image generation)

- **Stability AI**: https://stability.ai - Get API key (recommended)
- **Replicate**: https://replicate.com - Get API token

---

## Project Structure

```
municipal-flag-nft/
├── .env                    # Main configuration file
├── backend/                # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   ├── nft_game.db        # SQLite database (auto-created)
│   └── venv/
├── frontend/               # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── .env
├── contracts/              # Solidity smart contracts
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.js
└── ai-generator/           # AI image generation
    ├── generate_flags.py
    ├── upload_to_ipfs.py   # Uploads to IPFS & updates database directly
    ├── output/             # Generated images
    └── requirements.txt
```

---

## Phase 1: Clone & Configure

### 1.1 Clone the Repository

```bash
git clone <repository-url>
cd municipal-flag-nft
```

### 1.2 Configure Environment Variables

Edit the main `.env` file in the project root:

```bash
# Open .env and update these values:

# Admin API Key (change for production!)
ADMIN_API_KEY=your-secure-admin-key

# Blockchain - Your deployer wallet (WITHOUT 0x prefix)
DEPLOYER_PRIVATE_KEY=your-private-key-without-0x
WALLET_ADDRESS=0xYourWalletAddress

# PolygonScan API Key
POLYGONSCAN_API_KEY=your-polygonscan-api-key

# Pinata IPFS Keys
PINATA_API_KEY=your-pinata-api-key
PINATA_API_SECRET=your-pinata-api-secret
PINATA_JWT=your-pinata-jwt

# AI Image Generation (optional - choose one)
STABILITY_API_KEY=your-stability-api-key
# OR
REPLICATE_API_TOKEN=your-replicate-token

# Set to false if using placeholders instead of AI
SD_USE_CLOUD_API=false
```

---

## Phase 2: Backend Setup

### 2.1 Create Virtual Environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.3 Start Backend Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Verify:** Open http://localhost:8000/docs to see API documentation.

---

## Phase 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Frontend Environment

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_CONTRACT_ADDRESS=0xYourContractAddress  # Fill after deployment
VITE_CHAIN_ID=80002
VITE_CHAIN_NAME=Polygon Amoy Testnet
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_BLOCK_EXPLORER=https://amoy.polygonscan.com
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

### 3.3 Start Frontend Dev Server

```bash
npm run dev
```

**Verify:** Open http://localhost:5173 (or the URL shown in terminal).

---

## Phase 4: Smart Contract Deployment

### 4.1 Install Contract Dependencies

```bash
cd contracts
npm install
```

### 4.2 Compile Contracts

```bash
npx hardhat compile
```

### 4.3 Deploy to Polygon Amoy Testnet

Make sure your wallet has test MATIC from the faucet.

```bash
npx hardhat run scripts/deploy.js --network polygonAmoy
```

**Save the output!** You'll get a contract address like:
```
Contract deployed to: 0x62bbe0FFb425Fc10CeC28F2059F48268a110A9ad
```

### 4.4 Update Contract Address

Update the contract address in these files:

1. **Root `.env`:**
```env
CONTRACT_ADDRESS=0x62bbe0FFb425Fc10CeC28F2059F48268a110A9ad
REACT_APP_CONTRACT_ADDRESS=0x62bbe0FFb425Fc10CeC28F2059F48268a110A9ad
```

2. **`frontend/.env`:**
```env
VITE_CONTRACT_ADDRESS=0x62bbe0FFb425Fc10CeC28F2059F48268a110A9ad
```

### 4.5 Verify Contract on PolygonScan (Optional)

```bash
npx hardhat verify --network polygonAmoy 0x62bbe0FFb425Fc10CeC28F2059F48268a110A9ad
```

---

## Phase 5: Database Seeding

**Important:** The backend must be running for this step.

### 5.1 Seed Demo Data

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/seed" -Method POST -Headers @{"X-Admin-Key"="demo-admin-key-change-me"}
```

**Linux/Mac/Git Bash:**
```bash
curl -X POST "http://localhost:8000/api/admin/seed" \
  -H "X-Admin-Key: demo-admin-key-change-me"
```

**Expected Response:**
```json
{"message": "Demo data seeded successfully"}
```

### 5.2 Verify Seeding

```bash
curl "http://localhost:8000/api/countries"
```

Should return 4 countries (Spain, France, Germany, Italy).

---

## Phase 6: AI Image Generation

### 6.1 Setup AI Generator Environment

**Windows:**
```bash
cd ai-generator
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
cd ai-generator
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 6.2 Generate Flag Images

**Option A: Using AI (requires Stability AI or Replicate credits)**

Set in root `.env`:
```env
SD_USE_CLOUD_API=true
```

Then run:
```bash
python generate_flags.py
```

**Option B: Using Placeholders (free, no API needed)**

Set in root `.env`:
```env
SD_USE_CLOUD_API=false
```

Then run:
```bash
python generate_flags.py
```

This generates:
- 64 flag images in `ai-generator/output/`
- Metadata files in `ai-generator/metadata/`

---

## Phase 7: IPFS Upload

**Important:** Database must be seeded (Phase 5) before this step.

### 7.1 Upload to Pinata & Update Database

Make sure Pinata credentials are set in root `.env`, then:

```bash
cd ai-generator
python upload_to_ipfs.py
```

This script:
1. Reads flags from the database
2. Uploads images to IPFS via Pinata
3. Uploads metadata to IPFS
4. **Updates the database directly** with IPFS hashes

No JSON mapping files needed - everything is stored in the database!

### 7.2 Check Upload Status

```bash
python upload_to_ipfs.py --status
```

### 7.3 Verify Uploads (Optional)

```bash
python upload_to_ipfs.py --verify
```

### 7.4 Verify via API

```bash
curl "http://localhost:8000/api/admin/ipfs-status" -H "X-Admin-Key: demo-admin-key-change-me"
```

Expected response:
```json
{
  "total_flags": 64,
  "flags_with_image_hash": 64,
  "flags_with_metadata_hash": 64,
  "flags_pending_upload": 0
}
```

---

## Phase 8: Running the Application

### 8.1 Start All Services

Open 2 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# OR: source venv/bin/activate  # Linux/Mac
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 8.2 Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Contract (Amoy) | https://amoy.polygonscan.com/address/YOUR_CONTRACT |

### 8.3 Test the Application

1. Open http://localhost:5173
2. Click "Connect Wallet" - MetaMask will prompt to connect
3. Switch to Polygon Amoy Testnet if prompted
4. Browse countries and flags
5. Click on a flag to view details
6. Click "Claim First NFT (Free)" to mint

---

## Troubleshooting

### Backend Issues

**Error: Module not found**
```bash
cd backend
pip install -r requirements.txt
```

**Error: Database already has data**
```bash
# Reset database
curl -X POST "http://localhost:8000/api/admin/reset" -H "X-Admin-Key: demo-admin-key-change-me"
# Then seed again
curl -X POST "http://localhost:8000/api/admin/seed" -H "X-Admin-Key: demo-admin-key-change-me"
```

### Frontend Issues

**Error: Contract address not configured**
- Check `frontend/.env` has `VITE_CONTRACT_ADDRESS` set
- Restart frontend after changing `.env`

**Error: VITE_ variables not loading**
- Make sure variables start with `VITE_` (not `REACT_APP_`)
- Restart the dev server after changes

### Contract Issues

**Error: Insufficient funds**
- Get test MATIC from https://faucet.polygon.technology/

**Error: Contract verification failed**
- Wait a few minutes after deployment before verifying
- Check your POLYGONSCAN_API_KEY is correct

### Image Issues

**Images not showing**
- Check IPFS status: `curl "http://localhost:8000/api/admin/ipfs-status" -H "X-Admin-Key: demo-admin-key-change-me"`
- Re-run IPFS upload: `cd ai-generator && python upload_to_ipfs.py`
- Check `image_ipfs_hash` is not null in API response

### MetaMask Issues

**Wrong network**
- The app will prompt to switch to Polygon Amoy
- Chain ID: 80002
- RPC: https://rpc-amoy.polygon.technology

---

## Quick Reference Commands

```bash
# === BACKEND ===
cd backend && venv\Scripts\activate && python main.py

# === FRONTEND ===
cd frontend && npm run dev

# === DATABASE ===
# Seed database
curl -X POST "http://localhost:8000/api/admin/seed" -H "X-Admin-Key: demo-admin-key-change-me"

# Reset database
curl -X POST "http://localhost:8000/api/admin/reset" -H "X-Admin-Key: demo-admin-key-change-me"

# Check IPFS status
curl "http://localhost:8000/api/admin/ipfs-status" -H "X-Admin-Key: demo-admin-key-change-me"

# === AI GENERATOR ===
cd ai-generator && venv\Scripts\activate

# Generate images (placeholders)
python generate_flags.py

# Upload to IPFS (updates database directly)
python upload_to_ipfs.py

# Check upload status
python upload_to_ipfs.py --status

# Verify uploads
python upload_to_ipfs.py --verify

# === SMART CONTRACT ===
cd contracts

# Deploy contract
npx hardhat run scripts/deploy.js --network polygonAmoy

# Verify contract
npx hardhat verify --network polygonAmoy <CONTRACT_ADDRESS>
```

---

## Production Deployment Notes

For production deployment:

1. **Change all secrets** in `.env` files
2. **Use HTTPS** for all services
3. **Set `DEBUG=false`** and **`ENVIRONMENT=production`**
4. **Use a proper database** (PostgreSQL instead of SQLite)
5. **Deploy frontend** to Vercel, Netlify, or similar
6. **Deploy backend** to Railway, Render, or VPS with PM2/Gunicorn
7. **Consider using Polygon Mainnet** instead of Amoy testnet

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review API docs at http://localhost:8000/docs
- Check contract on PolygonScan for blockchain issues
