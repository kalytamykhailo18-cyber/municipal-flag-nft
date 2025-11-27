/**
 * Web3 Service for blockchain interactions
 */
import { ethers } from 'ethers';
import config from '../config';
import MunicipalFlagNFTABI from '../contracts/MunicipalFlagNFT.json';

// =============================================================================
// WALLET CONNECTION
// =============================================================================

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Get the current provider
 */
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Connect to MetaMask and get signer
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('Please install MetaMask to use this application');
  }

  const provider = getProvider();

  // Request account access
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found');
  }

  // Get signer
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // Check and switch network if needed
  await ensureCorrectNetwork();

  // Get balance
  const balance = await provider.getBalance(address);

  return {
    signer,
    address,
    balance: ethers.formatEther(balance),
  };
};

/**
 * Ensure connected to correct network
 */
export const ensureCorrectNetwork = async () => {
  if (!isMetaMaskInstalled()) return;

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const targetChainId = config.networkConfig.chainId;

  if (chainId !== targetChainId) {
    try {
      // Try to switch to the correct network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [config.networkConfig],
        });
      } else {
        throw switchError;
      }
    }
  }
};

/**
 * Get current connected address
 */
export const getCurrentAddress = async () => {
  if (!isMetaMaskInstalled()) return null;

  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts[0] || null;
};

/**
 * Listen for account changes
 */
export const onAccountsChanged = (callback) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

/**
 * Listen for network changes
 */
export const onChainChanged = (callback) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
  }
};

/**
 * Remove event listeners
 */
export const removeListeners = () => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// =============================================================================
// CONTRACT INTERACTION
// =============================================================================

/**
 * Get contract instance
 */
export const getContract = async (signerOrProvider = null) => {
  if (!config.contractAddress) {
    throw new Error('Contract address not configured');
  }

  if (!signerOrProvider) {
    const provider = getProvider();
    signerOrProvider = provider;
  }

  return new ethers.Contract(
    config.contractAddress,
    MunicipalFlagNFTABI.abi,
    signerOrProvider
  );
};

/**
 * Get contract with signer for write operations
 */
export const getContractWithSigner = async () => {
  const { signer } = await connectWallet();
  return getContract(signer);
};

/**
 * Claim first NFT (free)
 */
export const claimFirstNFT = async (flagId) => {
  const contract = await getContractWithSigner();

  const tx = await contract.claimFirstNFT(flagId);
  const receipt = await tx.wait();

  // Get token ID from event
  const event = receipt.logs.find(
    (log) => log.topics[0] === ethers.id('FirstNFTClaimed(uint256,uint256,address)')
  );

  return {
    transactionHash: receipt.hash,
    tokenId: event ? parseInt(event.topics[2], 16) : null,
  };
};

/**
 * Purchase second NFT
 */
export const purchaseSecondNFT = async (flagId, price) => {
  const contract = await getContractWithSigner();

  // Convert price to wei
  const priceWei = ethers.parseEther(price.toString());

  const tx = await contract.purchaseSecondNFT(flagId, { value: priceWei });
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
  };
};

/**
 * Get flag pair info from contract
 */
export const getFlagPair = async (flagId) => {
  const contract = await getContract();
  const pair = await contract.getFlagPair(flagId);

  return {
    flagId: pair.flagId.toString(),
    firstTokenId: pair.firstTokenId.toString(),
    secondTokenId: pair.secondTokenId.toString(),
    firstMinted: pair.firstMinted,
    secondMinted: pair.secondMinted,
    pairComplete: pair.pairComplete,
    category: pair.category,
    price: ethers.formatEther(pair.price),
  };
};

/**
 * Get price with discount for a user
 */
export const getPriceWithDiscount = async (flagId, userAddress) => {
  const contract = await getContract();
  const price = await contract.getPriceWithDiscount(flagId, userAddress);
  return ethers.formatEther(price);
};

/**
 * Check if user has Plus discount
 */
export const userHasPlus = async (userAddress) => {
  const contract = await getContract();
  return await contract.userHasPlus(userAddress);
};

/**
 * Check if user has Premium discount
 */
export const userHasPremium = async (userAddress) => {
  const contract = await getContract();
  return await contract.userHasPremium(userAddress);
};

/**
 * Get total supply of NFTs
 */
export const getTotalSupply = async () => {
  const contract = await getContract();
  const supply = await contract.totalSupply();
  return supply.toString();
};

/**
 * Get tokens owned by address
 */
export const getTokensOfOwner = async (address) => {
  const contract = await getContract();
  const balance = await contract.balanceOf(address);
  const tokens = [];

  for (let i = 0; i < balance; i++) {
    const tokenId = await contract.tokenOfOwnerByIndex(address, i);
    tokens.push(tokenId.toString());
  }

  return tokens;
};

/**
 * Get token URI
 */
export const getTokenURI = async (tokenId) => {
  const contract = await getContract();
  return await contract.tokenURI(tokenId);
};

export default {
  isMetaMaskInstalled,
  connectWallet,
  getCurrentAddress,
  ensureCorrectNetwork,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
  getContract,
  claimFirstNFT,
  purchaseSecondNFT,
  getFlagPair,
  getPriceWithDiscount,
  userHasPlus,
  userHasPremium,
  getTotalSupply,
  getTokensOfOwner,
  getTokenURI,
};
