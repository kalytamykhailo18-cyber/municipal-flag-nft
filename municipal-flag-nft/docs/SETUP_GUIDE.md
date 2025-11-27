# Setup Guide - Municipal Flag NFT Game

This guide walks you through setting up the complete development environment.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: v3.9 or higher
- **MetaMask**: Browser extension installed
- **Git**: For version control

## Step 1: Clone and Configure

```bash
# Navigate to project
cd municipal-flag-nft

# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:
- `ADMIN_API_KEY`: Set a secure admin password
- `DEPLOYER_PRIVATE_KEY`: Your wallet private key (for deployment)
- `PINATA_API_KEY` / `PINATA_API_SECRET`: From pinata.cloud
- `REPLICATE_API_TOKEN`: From replicate.com (for AI images)

## Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database and seed data
python seed_data.py

# Start backend server
python main.py
```

Backend runs at: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Step 3: Smart Contract Setup

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# (Optional) Start local node
npx hardhat node
```

### Deploy to Local Network

```bash
# In one terminal, run local node
npx hardhat node

# In another terminal, deploy
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Polygon Amoy Testnet

1. Get test MATIC from faucet: https://faucet.polygon.technology/
2. Ensure `DEPLOYER_PRIVATE_KEY` is set in `.env`
3. Deploy:

```bash
npx hardhat run scripts/deploy.js --network amoy
```

4. Copy the deployed contract address to `.env`:
```
CONTRACT_ADDRESS=0x...your_address...
REACT_APP_CONTRACT_ADDRESS=0x...your_address...
```

5. Register flags on contract:
```bash
npx hardhat run scripts/register-flags.js --network amoy
```

## Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: `http://localhost:3000`

## Step 5: Generate Images (Optional)

If you want to generate AI flag images:

```bash
cd ai-generator

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Generate images (uses placeholder if no AI API configured)
python generate_flags.py

# Upload to IPFS (requires Pinata API keys)
python upload_to_ipfs.py
```

## Step 6: Connect MetaMask

1. Open MetaMask in browser
2. Add Polygon Amoy network:
   - Network Name: `Polygon Amoy Testnet`
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Currency: `MATIC`
   - Explorer: `https://amoy.polygonscan.com`

3. Get test MATIC from faucet
4. Connect wallet on the frontend

## Step 7: Test the Application

1. **Backend Health**: Visit `http://localhost:8000/health`
2. **Admin Panel**: Go to `http://localhost:3000/admin`, enter admin key
3. **Seed Data**: Click "Seed Demo Data" if database is empty
4. **Explore**: Navigate countries → regions → municipalities → flags
5. **Claim NFT**: Connect wallet, claim a free first NFT
6. **Purchase NFT**: Purchase second NFT to complete a pair

## Troubleshooting

### Backend won't start
- Check Python version: `python --version`
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version`

### Contract deployment fails
- Ensure wallet has test MATIC
- Check private key is correct (no 0x prefix)
- Verify RPC URL is accessible

### MetaMask transaction fails
- Switch to correct network (Polygon Amoy)
- Ensure sufficient MATIC balance
- Try increasing gas limit

### CORS errors
- Backend must be running on port 8000
- Check CORS_ORIGINS in .env includes frontend URL

## Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Backend API | http://localhost:8000 | 8000 |
| API Docs | http://localhost:8000/docs | 8000 |
| Frontend | http://localhost:3000 | 3000 |
| Hardhat Node | http://localhost:8545 | 8545 |

## Environment Variables Checklist

- [ ] `ADMIN_API_KEY` - Set secure admin password
- [ ] `DEPLOYER_PRIVATE_KEY` - Wallet private key
- [ ] `CONTRACT_ADDRESS` - After deployment
- [ ] `REACT_APP_CONTRACT_ADDRESS` - Same as above
- [ ] `PINATA_API_KEY` - For IPFS uploads
- [ ] `PINATA_API_SECRET` - For IPFS uploads
- [ ] `REPLICATE_API_TOKEN` - For AI image generation (optional)
