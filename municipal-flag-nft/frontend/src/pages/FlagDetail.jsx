/**
 * Flag Detail Page - Full flag information with actions
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchFlag,
  fetchDiscountedPrice,
  registerInterest,
  claimFirstNFT,
  purchaseSecondNFT,
  selectCurrentFlag,
  selectFlagsLoading,
  selectActionLoading,
  selectDiscountedPrice,
} from '../store/slices/flagsSlice';
import { selectAddress, selectIsConnected } from '../store/slices/walletSlice';
import { claimFirstNFT as web3ClaimFirst, purchaseSecondNFT as web3PurchaseSecond } from '../services/web3';
import config from '../config';
import Loading from '../components/Loading';

const FlagDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const flag = useSelector(selectCurrentFlag);
  const loading = useSelector(selectFlagsLoading);
  const actionLoading = useSelector(selectActionLoading);
  const address = useSelector(selectAddress);
  const isConnected = useSelector(selectIsConnected);
  const discountedPrice = useSelector(selectDiscountedPrice(id));

  useEffect(() => {
    dispatch(fetchFlag(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (flag && address && config.contractAddress) {
      dispatch(fetchDiscountedPrice({ flagId: flag.id, address }));
    }
  }, [dispatch, flag, address]);

  const handleShowInterest = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    dispatch(registerInterest({ flagId: flag.id, address }));
  };

  const handleClaimFirst = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      const result = await web3ClaimFirst(flag.id);
      dispatch(claimFirstNFT({ flagId: flag.id, address, transactionHash: result.transactionHash }));
      alert('First NFT claimed successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePurchaseSecond = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      const price = discountedPrice || flag.price;
      const result = await web3PurchaseSecond(flag.id, price);
      dispatch(purchaseSecondNFT({ flagId: flag.id, address, transactionHash: result.transactionHash }));
      alert('Second NFT purchased! Pair complete!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading text="Loading flag details..." />;
  if (!flag) return <ErrorDisplay message="Flag not found" />;

  const imageUrl = flag.image_ipfs_hash
    ? config.getIpfsUrl(flag.image_ipfs_hash)
    : `https://via.placeholder.com/500x500/1a1a2e/e94560?text=${encodeURIComponent(flag.location_type)}`;

  const hasUserInterest = flag.interests?.some(i => i.user?.wallet_address === address?.toLowerCase());

  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <Link to="/countries">Countries</Link>
        {flag.municipality && (
          <>
            <span>/</span>
            <Link to={`/municipalities/${flag.municipality.id}`}>{flag.municipality.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-white">{flag.location_type}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <div className="card overflow-hidden">
            <img src={imageUrl} alt={flag.name} className="w-full aspect-square object-cover" />
          </div>
          <div className="flex gap-2 mt-4">
            <span className={`badge badge-${flag.category.toLowerCase()}`}>{flag.category}</span>
            <span className={`badge ${flag.is_pair_complete ? 'badge-complete' : flag.first_nft_status === 'claimed' ? 'badge-claimed' : 'badge-available'}`}>
              {flag.is_pair_complete ? 'Complete' : flag.first_nft_status === 'claimed' ? 'First Claimed' : 'Available'}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{flag.location_type} Flag</h1>
          <p className="text-gray-400 font-mono mb-6">{flag.name}</p>

          {/* Price */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Base Price:</span>
              <span className="text-white font-semibold">{config.formatPrice(flag.price)} MATIC</span>
            </div>
            {discountedPrice && discountedPrice !== flag.price && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Your Price:</span>
                <span className="text-primary font-semibold">{config.formatPrice(discountedPrice)} MATIC</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 mb-8">
            {!flag.is_pair_complete && (
              <>
                {flag.first_nft_status === 'available' && (
                  <>
                    {!hasUserInterest && (
                      <button
                        onClick={handleShowInterest}
                        disabled={actionLoading}
                        className="btn btn-secondary w-full"
                      >
                        {actionLoading ? 'Processing...' : 'Show Interest'}
                      </button>
                    )}
                    <button
                      onClick={handleClaimFirst}
                      disabled={actionLoading}
                      className="btn btn-primary w-full"
                    >
                      {actionLoading ? 'Processing...' : 'Claim First NFT (Free)'}
                    </button>
                  </>
                )}
                {flag.first_nft_status === 'claimed' && flag.second_nft_status === 'available' && (
                  <button
                    onClick={handlePurchaseSecond}
                    disabled={actionLoading}
                    className="btn btn-primary w-full"
                  >
                    {actionLoading ? 'Processing...' : `Purchase Second NFT (${config.formatPrice(discountedPrice || flag.price)} MATIC)`}
                  </button>
                )}
              </>
            )}
            {flag.is_pair_complete && (
              <div className="card p-4 bg-primary/10 border-primary/30 text-center">
                <p className="text-primary">This flag pair has been completed</p>
              </div>
            )}
          </div>

          {/* Interested Users */}
          <div className="card p-6 mb-4">
            <h3 className="text-white font-semibold mb-4">Interested Users ({flag.interests?.length || 0})</h3>
            {flag.interests?.length > 0 ? (
              <ul className="space-y-2">
                {flag.interests.map((interest) => (
                  <li key={interest.id} className="text-gray-400 text-sm font-mono">
                    {config.truncateAddress(interest.user?.wallet_address)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No one has shown interest yet</p>
            )}
          </div>

          {/* Owners */}
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">Owners</h3>
            {flag.ownerships?.length > 0 ? (
              <ul className="space-y-2">
                {flag.ownerships.map((ownership) => (
                  <li key={ownership.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 font-mono">{config.truncateAddress(ownership.user?.wallet_address)}</span>
                    <span className="text-gray-500">{ownership.ownership_type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No owners yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ message }) => (
  <div className="page-container">
    <div className="text-center py-16">
      <p className="text-red-400">{message}</p>
    </div>
  </div>
);

export default FlagDetail;
